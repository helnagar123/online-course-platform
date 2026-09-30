import Joi from 'joi';

import {
  objectIdSchema,
  paginationSchema
} from './common.validator.js';

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

export const userIdParamSchema = Joi.object({
  userId: objectIdSchema
});

export const userListQuerySchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .default(''),

  role: Joi.string()
    .valid('admin', 'instructor', 'student'),

  isActive: Joi.boolean(),

  page: paginationSchema.page,

  limit: paginationSchema.limit,

  sortBy: Joi.string()
    .valid(
      'createdAt',
      'firstName',
      'lastName',
      'email'
    )
    .default('createdAt'),

  sortOrder: paginationSchema.sortOrder
});