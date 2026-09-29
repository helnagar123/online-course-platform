import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(255)
    .required(),

  password: Joi.string()
    .min(8)
    .max(72)
    .required(),

  role: Joi.string()
    .valid('student', 'instructor')
    .default('student')
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .max(255)
    .required(),

  password: Joi.string()
    .required()
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .trim()
    .required()
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .trim()
    .required()
});