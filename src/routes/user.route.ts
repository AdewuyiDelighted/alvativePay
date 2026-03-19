import express from "express";
import { authorize_direct_debit, get_user, login, register_user } from "../controllers/user.controller";
import { get } from "http";

const routes = express.Router();

export const PATHS = {
    register_user: "/register-user",
    login:"/login",
    get_user:"/get-user",
    authorize_direct_debit:"/authorize-direct-debit",
};

routes.post(PATHS.register_user,register_user)
routes.post(PATHS.login,login)
routes.get(PATHS.get_user,get_user)
routes.post(PATHS.authorize_direct_debit,authorize_direct_debit);
export default routes;