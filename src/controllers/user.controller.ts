import { Request, Response } from "express";
import { login_user_validator, register_user_validator } from "../validators/user.validator";
import { generateToken, hashPassword, verifyPassword } from "../utils/util";
import { user_service } from "../models/user.model";



export const register_user = async (req: Request, res: Response) =>  {
    console.log("enter one")
    try{  
    const { error,value } = register_user_validator(req.body);

      if(error){
        throw new Error(error );

       }
        
        const found_user = await user_service.get_account_by_email(value.email)
        
        if(found_user){
            throw new Error("User with email already exist")
        }

        console.log("USER ",found_user)
        const hashedPassword = await hashPassword(value.password);

        const user = await user_service.register_user(value,hashedPassword)
        console.log("USER",user)

         res.status(200).send({
            status: "success",
            message: "Your request was successful",
            data: user,
        });
    }catch(error:any){
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
        
      const user = await user_service.get_account_by_email(value.email);
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


