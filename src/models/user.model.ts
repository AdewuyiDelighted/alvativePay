import { DirectDebitMandateStatus } from "@prisma/client";
import { db } from "../utils/db.connect.util";

interface IRegisterUser{
    last_name: string,
    first_name: string,
    phone_number: string,
    email: string,
    password:string
  }

export const user_service = {
    register_user: async (data: IRegisterUser,hashedPassword:string) => {
        return db.user.create({
          data: {
            first_name:data.first_name,
            last_name:data.last_name,
            email:data.email,
            password:hashedPassword,
            phone_number:data.phone_number
          },
        });
    },
    get_user_by_email:async(email:string)=>{ 
        return db.user.findUnique({
            where:{
                email
            }
        })
    },

    get_user_by_id:async(id:string)=>{ 
        return db.user.findUnique({
            where:{
                id
            },
            include:{
                directDebitMandates:true
            }
        })
    },

    update_user_balance:async(user_id:string,amount:number)=>{
        return db.user.update({
            where:{
                id:user_id
            },
            data:{
                balance:amount
            }
        })
    },

    get_user_balance:async(user_id:string)=>{
        return db.user.findUnique({
            where:{
                id:user_id
            },
            select:{
                balance:true,
            }
        })
    },
    update_direct_debit_mandate : async(data:any,status:DirectDebitMandateStatus) => {
        return db.directDebitMandate.update({
          where:{
            reference: data.reference,
          },
            data: {
              authorization_code: data.authorization_code,
              status,
              channel: data.channel,
              last4:data.last4,
              card_type: data.card_type,
              bank: data.bank,
              exp_month: data.exp_month,
              exp_year: data.exp_year,
              country_code:data.country_code,
              brand: data.brand,
              account_name: data.account_name,
              customer_first_name: data.customer.first_name,
              customer_last_name: data.customer.last_name,
              customer_code: data.customer.code,
              customer_email: data.customer.email,
              customer_phone: data.customer.phone,
              signature: data.signature,
            },
          })
        },
      

}