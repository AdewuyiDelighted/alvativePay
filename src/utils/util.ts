import bcrypt from 'bcrypt';
import { NextFunction,Request,Response } from 'express';
import jwt from 'jsonwebtoken';


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