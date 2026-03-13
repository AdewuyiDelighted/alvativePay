import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextFunction,Request,Response } from 'express';
import jwt from 'jsonwebtoken';
import { user_service } from '../models/user.model';


const saltRounds = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const generateToken = (payload: string,): string => {
  return jwt.sign({payload}, JWT_SECRET, {
    expiresIn: 900,
  });
};


export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      throw new Error('Access denied. No token provided.');
    }

    
    if (!authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid token format.');
    }

    
    const token = authHeader.replace('Bearer ', '');

   
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

   
    (req as any).user = decoded;

    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
       res.status(401).send({
        status: 'failed',
        message: 'Token has expired',
      });
    }
    if (error.name === 'JsonWebTokenError') {
       res.status(401).send({
        status: 'failed',
        message: 'Invalid token',
      });
    }
    res.status(500).send({
      status: 'failed',
      message: error.message || 'Authentication failed',
    });
  }
};

export function amount_check(amount:number){
if(amount <= 0){
  throw new Error("Invalid amount")
}

}

export async function validate_values(amount:number,sender_id:string,receiver_id:string,password:string){
  const found_user = await user_service.get_user_by_id(sender_id)
  if(!found_user){
    throw new Error("User Doesn't Exist")
  }

  const isValidPassword = await verifyPassword(password, found_user.password);
    
    if (!isValidPassword){
      throw new Error("Invalid details")
    }
  
  amount_check(amount)
  

  const receiver = await user_service.get_user_by_id(receiver_id)

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