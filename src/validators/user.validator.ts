import Joi from "joi";
import { validator } from "./validator.utils";

const register_user = Joi.object({
    last_name: Joi.string().required(),
    first_name: Joi.string().required(),
    phone_number: Joi.string().optional().allow(""),
    email: Joi.string().email().required(),
    password:Joi.string().required()
  });
  
  export const register_user_validator = validator(register_user);

  const login_user = Joi.object({
    email: Joi.string().email().required(),
    password:Joi.string().required()
  });
  
  export const login_user_validator = validator(login_user);