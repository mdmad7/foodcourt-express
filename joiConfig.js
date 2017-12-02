import Joi from 'joi';

export const createUser = {
  body: {
    name: Joi.object({
      first_name: Joi.string().required(),
      family_name: Joi.string().required(),
      other_names: Joi.string(),
    }).required(),
    gender: Joi.string()
      .required()
      .valid('male', 'female'),
    date_of_birth: Joi.date().required(),
    username: Joi.string(),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/)
      .required(),
    // isDeleted: Joi.boolean(),
    friends: Joi.array(),
    favourite_vendors: Joi.array(),
  },
};

export const updateUser = {
  body: {
    name: Joi.object({
      first_name: Joi.string(),
      family_name: Joi.string(),
      other_names: Joi.string(),
    }).required(),
    gender: Joi.string().valid('Male', 'Female'),
    date_of_birth: Joi.date(),
    username: Joi.string(),
  },
  params: {
    id: Joi.string().required(),
  },
};
