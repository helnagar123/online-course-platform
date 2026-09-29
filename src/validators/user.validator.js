import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50),

  avatar: Joi.string()
    .trim()
    .uri({
      scheme: ['http', 'https']
    })
    .allow(null, '')
}).min(1);

export const adminUpdateUserSchema = Joi.object({
  role: Joi.string()
    .valid('admin', 'instructor', 'student'),

  isActive: Joi.boolean()
}).min(1);