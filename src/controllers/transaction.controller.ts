import { Request, Response,RequestHandler } from 'express';
import {  transaction_service,  } from '../models/transaction.model';
import { deposit_money_validator, get_user_transaction_history_validator, transfer_funds_validator, validate_transfer_validator } from '../validators/transaction.validator';
import { user_service } from '../models/user.model';
import { TransactionStatus, TransactionType, User } from '@prisma/client';
import { amount_check, validate_values, verifyPassword } from '../utils/helper.util';
import crypto from "crypto";
import { initialize_transaction, verify_payment } from '../utils/paystack.util';


export const initialize_payment = async (req: Request, res: Response) => {
  try {
    const { error, value } = deposit_money_validator(req.body);

    if(error){
        throw new Error(error );
    }
    const found_user = await user_service.get_user_by_id(value.user_id)
    
    if(!found_user){
        throw new Error("User Doesn't Exist")
    }
    const isValidPassword = await verifyPassword(value.password, found_user.password);
    
    if (!isValidPassword){
      throw new Error("Invalid details")
    }

    amount_check(value.amount)
    const payment_data = await initialize_transaction(found_user.email,value.amount);

    const data = {
      amount:value.amount,
      user_id:found_user.id,
      transaction_type:TransactionType.DEPOSIT,
      reference:payment_data.data.reference
    }
   const created_transaction =  await transaction_service.create_transaction(data,TransactionStatus.INITIATED)    
   console.log("CREATED TRANSACTION", created_transaction)  

    res.status(200).send({
      status: 'success',
      message: 'Payment initialized successfully',
      data: payment_data,
    });
  } catch (error: any) {
     res.status(500).send({
      status: 'failed',
      message: error.message,
    });
  }
};

export const verify_transaction = async (req: Request, res: Response) => {
  try {
    const { error,value } = validate_transfer_validator(req.body);
    if(error){
      throw new Error(error );
  }
  const found_user = await user_service.get_user_by_id(value.user_id)
  
  if(!found_user){
    throw new Error("User Doesn't Exist")
  }

  const transaction = await transaction_service.get_transaction_by_id(value.transaction_id);
  let updated_user
  if(!transaction || !transaction.reference){
    throw new Error("Transaction Doesn't Exist")
  }
  const verified_data = await verify_payment(transaction?.reference)

    if (verified_data.data.status !== 'success') {
      await transaction_service.update_transaction(value.transaction_id,TransactionStatus.FAILED)      
      throw new Error('Payment not successful'); 
    } else {
      const amount = verified_data.data.amount / 100; 
      const intial_balance = (await transaction_service.get_user_balance(found_user.id))?._sum?.amount || 0;
      const new_balance = intial_balance + amount;
      updated_user = await user_service.update_user_balance(found_user.id, new_balance);
      await transaction_service.update_transaction(value.transaction_id,TransactionStatus.SUCCESSFULL)  
    }
    const { password, ...user_without_password} = updated_user  


    res.status(200).send({
      status: 'success',
      message: 'Payment verified and user balance updated',
      data: user_without_password,
    });
  } catch (error: any) {
    res.status(500).send({
      status: 'failed',
      message: error.message,
    });
  }
};

export const get_user_transaction_history = async (req: Request, res: Response) => {
  try {
    const { error, value } = get_user_transaction_history_validator(req.query);

    if(error){
        throw new Error(error );
    }
    const found_user = await user_service.get_user_by_id(value.user_id)
    
    if(!found_user){
        throw new Error("User Doesn't Exist")
    }
    const transactions = await transaction_service.get_user_transactions(value.user_id)
    
    res.status(200).send({
      status: 'success',
      message: 'Payment initialized successfully',
      data: transactions,
    });
  } catch (error: any) {
     res.status(500).send({
      status: 'failed',
      message: error.message,
    });
  }
};

export const process_paystack_webhook = async (req: Request, res: Response): Promise<void> => {
  console.log("PAYSTACK WEBHOOK CALLED");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  
  try {
    const hash = crypto
      .createHmac("sha512", secret!)
      .update(JSON.stringify(req.body))
      .digest("hex");
    
    console.log("PAYSTACK HASH CALLED");

    if (hash !== req.headers["x-paystack-signature"]) {
      console.log("PAYSTACK SECURITY CHECK FAILED");
      res.status(401).send("Invalid signature");
      return; 
    }
    
    console.log("PAYSTACK EVENT", req.body);
    
    const event = req.body.event;
    const data = req.body.data;

    switch (event) {  
      case "charge.success":
        const transact: any = await verify_payment(data.reference);
        console.log("CHARGE SUCCESS", transact.data);
        
        const transactionSuccessful =
          transact.data.gateway_response.toLowerCase().includes("approved by financial institution") ||
          transact.data.gateway_response.toLowerCase().includes("approved") ||
          transact.data.gateway_response.toLowerCase().includes("successful");
          
        if (!transactionSuccessful) {
          console.log("Transaction not successful, skipping wallet credit.");
          res.status(400).json({ message: "Transaction not successful" });
          return; 
        }
        
        const updated_transaction = await transaction_service.update_transaction_reference(
          transact.data.reference, 
          TransactionStatus.SUCCESSFULL
        ); 
        
        const transaction_data = transact.data;
        const found_user = await user_service.get_user_by_id(updated_transaction.user_id);
        console.log("FOUND USER", found_user);
        
        const amount = transaction_data.data.amount / 100; 
        const intial_balance = (await transaction_service.get_user_balance(found_user?.id!))?._sum?.amount || 0;
        const new_balance = intial_balance + amount;
        const updated_user = await user_service.update_user_balance(found_user?.id!, new_balance);
        console.log("USER BALANCE UPDATED", updated_user);
        break;
        
      default:
        console.log(`Unhandled event type: ${event}`);
    }
    res.status(200).json({ message: "Webhook received" });
    
  } catch(error: any) {
    console.error("Error processing Paystack webhook:", error);
    res.status(500).send("Internal Server Error");
  }
}
