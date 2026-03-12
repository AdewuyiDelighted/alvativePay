import Joi from "joi";
import { validator } from "./validator.utils";

const deposit_money = Joi.object({
    user_id: Joi.string().required(),
    password:Joi.string().required(),
    amount:Joi.number().required()
  });
  
  export const deposit_money_validator = validator(deposit_money);

  const validate_transfer = Joi.object({
    user_id: Joi.string().required(),
    reference:Joi.string().required()
  });
  
  export const validate_transfer_validator = validator(validate_transfer);

  const transfer_funds = Joi.object({
    sender_id: Joi.string().required(),
    receiver_id:Joi.string().required(),
    amount:Joi.number().required(),
    password:Joi.string().required(),
  });
  
  export const transfer_funds_validator = validator(transfer_funds);

  const get_user_transaction_history = Joi.object({
    user_id: Joi.string().required(),
    password:Joi.string().required()
  });
  
  export const get_user_transaction_history_validator = validator(get_user_transaction_history);