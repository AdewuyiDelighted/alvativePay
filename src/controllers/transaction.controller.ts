import { Request, Response } from 'express';
import {  transaction_service,  } from '../models/transaction.model';
import { deposit_money_validator, get_user_transaction_history_validator, transfer_funds_validator, validate_transfer_validator } from '../validators/transaction.validator';
import { user_service } from '../models/user.model';
import { TransactionStatus, TransactionType, User } from '@prisma/client';
import { verifyPassword } from '../utils/util';
import { io } from '../utils/socket.util';


export const initialize_payment = async (req: Request, res: Response) => {
  try {
    const { error, value } = deposit_money_validator(req.body);

    if(error){
        throw new Error(error );
    }
    const found_user = await user_service.get_account_by_id(value.user_id)
    
    if(!found_user){
        throw new Error("User Doesn't Exist")
    }
    const isValidPassword = await verifyPassword(value.password, found_user.password);
    
    if (!isValidPassword){
      throw new Error("Invalid details")
    }

    amount_check(value.amount)
    const payment_data = await transaction_service.initialize_payment(found_user.email,value.amount);

    
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

 // Verify payment and update user balance
export const verify_transaction = async (req: Request, res: Response) => {
  try {
    const { error,value } = validate_transfer_validator(req.body);
    if(error){
      throw new Error(error );
  }
  const found_user = await user_service.get_account_by_id(value.user_id)
  
  if(!found_user){
      throw new Error("User Doesn't Exist")
  }

  
  const verified_data = await transaction_service.verify_payment(value.reference)
    const data = {
      amount:verified_data.data.amount,
      sender_id:found_user.id,
      receiver_id:undefined,
      transaction_type:TransactionType.DEPOSIT,
    }


    if (verified_data.data.status !== 'success') {
      await transaction_service.create_transaction(data,TransactionStatus.FAILED)      
      throw new Error('Payment not successful'); 
    } else {
      await transaction_service.create_transaction(data,TransactionStatus.SUCCESSFULL)

    }

    const amount = verified_data.data.amount / 100; 
    const new_balance = found_user.balance + amount
    const updatedUser = await user_service.update_user_balance(found_user.id, new_balance);


    res.status(200).send({
      status: 'success',
      message: 'Payment verified and user balance updated',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).send({
      status: 'failed',
      message: error.message,
    });
  }
};

export const transfer_fund = async (req: Request, res: Response) => {
  try {
    const { error,value } = transfer_funds_validator(req.body);
    if(error){
      throw new Error(error );
    }
  const result  = await validate_values(value.amount,value.sender_id,value.receiver_id,value.password)
  if(result){
    
    const data = {
      amount:value.amount,
      sender_id:value.sender_id,
      receiver_id:value.receiver_id,
      transaction_type:TransactionType.TRANSFER,
    }

    const sender_new_balance = result.data.sender.balance - value.amount
    const updated_sender = await user_service.update_user_balance(value.sender_id, sender_new_balance);
    
    const receiver_new_balance = result.data.receiver.balance + value.amount
    const updated_receiver = await user_service.update_user_balance(value.receiver_id, receiver_new_balance);

    send_notification(result.data.sender,result.data.receiver,value.amount)

    await transaction_service.create_transaction(data,TransactionStatus.SUCCESSFULL)      


    res.status(200).send({
      status: 'success',
      message: 'Payment verified and user balance updated',
      data: {
        sender:updated_sender,
        receiver:updated_receiver
      },
    });
  }else{
    const data = {
      amount:value.amount,
      sender_id:value.sender_id,
      receiver_id:value.receiver_id,
      transaction_type:TransactionType.TRANSFER,
    }
    await transaction_service.create_transaction(data,TransactionStatus.SUCCESSFULL)      

  }
  } catch (error: any) {

    res.status(500).send({
      status: 'failed',
      message: error.message,
    });
  }
};

function amount_check(amount:number){
  if(amount <= 0){
    throw new Error("Invalid amount")
  }

}

async function validate_values(amount:number,sender_id:string,receiver_id:string,password:string){
  const found_user = await user_service.get_account_by_id(sender_id)
  if(!found_user){
    throw new Error("User Doesn't Exist")
  }

  const isValidPassword = await verifyPassword(password, found_user.password);
    
    if (!isValidPassword){
      throw new Error("Invalid details")
    }
  
  amount_check(amount)
  

  const receiver = await user_service.get_account_by_id(receiver_id)

  if(!receiver){
      throw new Error("Invalid Receiver")
  }


    const sender_balance = await user_service.get_user_balance(sender_id)
    if(sender_balance?.balance){
      if(amount > sender_balance?.balance){
        throw new Error("Insufficient Funds")
      }
    }

    return {
      data:{
        sender:found_user,
        receiver:receiver
      }
    }


}

export const get_user_transaction_history = async (req: Request, res: Response) => {
  try {
    const { error, value } = get_user_transaction_history_validator(req.body);

    if(error){
        throw new Error(error );
    }
    const found_user = await user_service.get_account_by_id(value.user_id)
    
    if(!found_user){
        throw new Error("User Doesn't Exist")
    }
    const isValidPassword = await verifyPassword(value.password, found_user.password);
    
    if (!isValidPassword){
      throw new Error("Invalid details")
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

async function send_notification(sender:User,receiver:User,amount:number){
  io.emit('notification', {
    userId: sender.id,
    message: `You have transferred ₦${amount} to  ${receiver.last_name + receiver.first_name}.`,
    balance: sender.balance,
  });

  io.emit('notification', {
    userId: receiver.id,
    message: `You have received ₦${amount} from user ${sender.last_name + receiver.first_name}.`,
    balance: receiver.balance,
  });
}