import { Request, Response } from "express";
import { intialize_direct_debit_validator, login_user_validator, register_user_validator } from "../validators/user.validator";
import { generateToken, hashPassword, verifyPassword } from "../utils/helper.util";
import { user_service } from "../models/user.model";
import { authorize_user_direct_debit } from "../utils/paystack.util";
import { db } from "../utils/db.connect.util";
import { DirectDebitMandateStatus } from "@prisma/client";



export const register_user = async (req: Request, res: Response) =>  {
  try{  
    const { error,value } = register_user_validator(req.body);

      if(error){
        throw new Error(error );
      }
        
      const found_user = await user_service.get_user_by_email(value.email)
      
      if(found_user){
        throw new Error("User with email already exist")
      }

      const hashedPassword = await hashPassword(value.password);
      const user = await user_service.register_user(value,hashedPassword)
      const token = generateToken(user.id);


      res.status(200).send({
        status: "success",
        message: "Your request was successful",
        data: user,
        token: token
      });
  } catch(error:any){
    res.status(500).send({
      status: "failed",
      message: "Your request was unsuccessful",
      data:error.message
    });
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { error,value } = login_user_validator(req.body);

    if(error){
      throw new Error(`${error.message}`);
    }
      
    const user = await user_service.get_user_by_email(value.email);
    if (!user) {
      throw new Error("User Not Found")
    }

    const isValidPassword = await verifyPassword(value.password, user.password);

    if (!isValidPassword){
      throw new Error("Invalid details")
    }
    const token = generateToken(user.id);
      res.status(200).send({
      status: "success",
      message: "Your request was successful",
      user_id: user.id,
      data: token,
    });
  } catch (error: any) {
    res.status(200).send({
      status: "failed",
      message: "Your request was unsuccessful",
      data:error.message
    });
  } 
}

export const get_user = async (req: Request, res: Response) => {
  try {
    
    const user_id = req.query.id;
    console.log("USER ID",user_id)
    const user = await user_service.get_user_by_id(user_id as string);
    if (!user) {
      throw new Error("User Not Found")
    }
    const { password, ...user_without_password} = user

    res.status(200).send({
    status: "success",
    message: "Your request was successful",
    data: user_without_password,
  });
  } catch(error: any){
    res.status(200).send({
      status: "failed",
      message: "Your request was unsuccessful",
      data:error.message
    });

  }
}

export const authorize_direct_debit = async (req: Request, res: Response) => {
  try {
    const { error, value } = intialize_direct_debit_validator(req.body);

    if(error){
        throw new Error(error );
    }
    const found_user = await user_service.get_user_by_id(value.user_id)
    
    if(!found_user){
        throw new Error("User Doesn't Exist")
    }
  
    const response = await authorize_user_direct_debit(found_user.email, "https://yourapp.com/direct-debit-callback");
    const created_mandate = await db.directDebitMandate.create({
      data:{
        user_id:found_user.id,
        reference:response.data.reference,
        status:DirectDebitMandateStatus.initialized,
      }  
    })
    console.log("Created Mandate", created_mandate)


    res.status(200).send({
      status: 'success',
      message: 'Direct debit authorization in process',
      data: response,
    });
  } catch (error: any) {
     res.status(500).send({
      status: 'failed',
      message: error.message,
    });
  }
};
