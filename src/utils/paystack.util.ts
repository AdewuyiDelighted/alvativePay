import { DirectDebitMandateStatus, TransactionType } from "@prisma/client";
import axios from "axios";
import { user_service } from "../models/user.model";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL as string;




export async function initialize_transaction(email: string, amount: number){
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
}


export async function verify_payment (reference: string) {
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
}

export async function authorize_user_direct_debit(
  email: string,
  callbackUrl: string
){
  try {
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/customer/authorization/initialize`,
      {
        email,
        channel: "direct_debit",
        callback_url: callbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      `Failed to initialize direct debit: ${error.response?.data?.message || error.message}`
    );
  }
}

export async function charge_direct_debit_account(authorization_code:string,amount:number,email:string){ 

  const response = await axios.post(
    `${process.env.PAYSTACK_BASE_URL}/transaction/charge_authorization`,
    {
      email: email,
      amount:amount * 100,
      authorization_code:authorization_code,
      currency: "NGN",
    },
    
    {
      headers:{
        Authorization : `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
  console.log("Response", response);
  return response.data;
}
    
export async function paystack_direct_debit_created(data:any) {
  console.log("DIRECT DEBIT MANDATE CREATED",data)
 await user_service.update_direct_debit_mandate(data,DirectDebitMandateStatus.pending)
}

export async function paystack_direct_debit_active(data:any) {
  console.log("DIRECT DEBIT MANDATE ACTIVE",data)
  await user_service.update_direct_debit_mandate(data,DirectDebitMandateStatus.active)
}
