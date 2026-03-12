import express from "express";
import { login, register_user } from "../controllers/user.controller";

const routes = express.Router();

export const PATHS = {
    register_user: "/register-user",
    login:"/login"
};

routes.post(PATHS.register_user,register_user)
routes.post(PATHS.login,login)
export default routes;