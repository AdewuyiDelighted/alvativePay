import express from "express";
import { get_user, login, register_user } from "../controllers/user.controller";
import { get } from "http";

const routes = express.Router();

export const PATHS = {
    register_user: "/register-user",
    login:"/login",
    get_user:"/get-user"
};

routes.post(PATHS.register_user,register_user)
routes.post(PATHS.login,login)
routes.get(PATHS.get_user,get_user)
export default routes;