import { db } from "../utils/db.connect.util";

import { TransactionStatus, TransactionType } from "@prisma/client";
import axios from "axios"


const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL as string;

export interface ICreateTransaction{
  amount:number
  sender_id:string
  receiver_id: string |undefined
  transaction_type: TransactionType,
}

export const transaction_service = {


initialize_payment:async (email: string, amount: number) => {
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, 
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to initialize payment: ${error.message}`);
  }
},


verify_payment : async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to verify payment: ${error.message}`);
  }
},

create_transaction: async (data:ICreateTransaction,transaction_status:TransactionStatus) => {
  return db.transaction.create({
    data: {
      amount:data.amount,
      sender_id:data.sender_id,
      receiver_id:data.receiver_id ,
      transaction_type:data.transaction_type,
      transaction_status:transaction_status,
      
    },
  });
},
get_user_transactions: async(user_id:string)=>{
  return db.transaction.findMany({
    where: {
      OR: [
        { sender_id: user_id }, 
        { receiver_id: user_id }, 
      ],
    },
    include: {
      sender: {
        select: {
          id: true,
          first_name:true,
          last_name:true,
          email: true,
        },
      },
      receiver: {
        select: {
          id: true,
          first_name:true,
          last_name:true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', 
    },
  })

}
}