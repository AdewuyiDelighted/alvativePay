import express from "express";
import {  get_user_transaction_history, initialize_payment, transfer_fund, verify_transaction } from "../controllers/transaction.controller";
import { authenticate } from "../utils/util";

const routes = express.Router();

export const PATHS = {
    initialize_payment : "/initialize-payment",
    verify_transaction:"/verify-transaction",
    transfer_fund:"/transfer-fund",
    get_user_transaction_history:"/get-user-transaction-history"

};

routes.post(PATHS.initialize_payment,authenticate,initialize_payment)
routes.post(PATHS.verify_transaction,authenticate,verify_transaction)
routes.post(PATHS.transfer_fund,authenticate,transfer_fund)
routes.get(PATHS.get_user_transaction_history,authenticate,get_user_transaction_history)


export default routes;