import Joi from 'joi';

export const objectIdSchema = Joi.string()
  .hex()
  .length(24)
  .required();

export const optionalObjectIdSchema = Joi.string()
  .hex()
  .length(24);

export const paginationSchema = {
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
};

export const courseSearchQuerySchema = Joi.object({
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .default(''),

  category: optionalObjectIdSchema,

  level: Joi.string().valid(
    'beginner',
    'intermediate',
    'advanced'
  ),

  status: Joi.string().valid(
    'draft',
    'published',
    'archived'
  ),

  instructor: optionalObjectIdSchema,

  page: paginationSchema.page,

  limit: paginationSchema.limit,

  sortBy: Joi.string()
    .valid('createdAt', 'title', 'price')
    .default('createdAt'),

  sortOrder: paginationSchema.sortOrder
});