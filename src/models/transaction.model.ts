import { db } from "../utils/db.connect.util";

import { TransactionStatus, TransactionType } from "@prisma/client";
import axios from "axios"

export interface ICreateTransaction{
  amount:number
  user_id:string
  transaction_type: TransactionType,
  reference:string
}

export const transaction_service = {


  create_transaction: async (data:ICreateTransaction,transaction_status:TransactionStatus) => {
    return db.transaction.create({
      data: {
        amount:data.amount,
        user_id:data.user_id,
        transaction_type:data.transaction_type,
        transaction_status:transaction_status,
        reference:data.reference
      },
    });
  },
  get_user_transactions: async(user_id:string)=>{
    return db.transaction.findMany({
      where: {
      user_id: user_id,
      },
      include: {
        user: {
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

  },
  update_transaction: async (transaction_id:string,transaction_status:TransactionStatus) => {
    return db.transaction.update({
      where: {
        id: transaction_id,
      },
      data: {
        transaction_status: transaction_status,
      },
    });
  },
  update_transaction_reference: async (transaction_reference:string,transaction_status:TransactionStatus) => {
    return db.transaction.update({
      where: {
        reference: transaction_reference,
      },
      data: {
        transaction_status: transaction_status,
      },
    });
  },
  get_transaction_by_id: async (transaction_id:string) => {
    return db.transaction.findUnique({
      where: {
        id: transaction_id,
      },
    });
  },
  get_user_balance: async(user_id:string)=>{
    return db.transaction.aggregate({
      where:{
        user_id:user_id,
        transaction_status:TransactionStatus.SUCCESSFULL
      },
      _sum:{
        amount:true
      }
    })
  }
}