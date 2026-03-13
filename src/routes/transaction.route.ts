import express, { RequestHandler } from "express";
import {  get_user_transaction_history, initialize_payment,process_paystack_webhook, verify_transaction } from "../controllers/transaction.controller";
import { authenticate } from "../utils/helper.util";
const routes = express.Router();

export const PATHS = {
    initialize_payment : "/initialize-payment",
    verify_transaction:"/verify-transaction",
    transfer_fund:"/transfer-fund",
    get_user_transaction_history:"/get-user-transaction-history",
    paystack_webhook:"/paystack-webhook"

};

routes.post(PATHS.initialize_payment,authenticate,initialize_payment)
routes.post(PATHS.verify_transaction,authenticate,verify_transaction)
routes.get(PATHS.get_user_transaction_history,authenticate,get_user_transaction_history)
routes.post(PATHS.paystack_webhook, process_paystack_webhook)
export default routes;