import Joi from 'joi';
import {
  objectIdSchema,
  courseSearchQuerySchema
} from './common.validator.js';

export const createCourseSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required(),

  description: Joi.string()
    .trim()
    .min(20)
    .max(5000)
    .required(),

  category: objectIdSchema,

  thumbnail: Joi.string()
    .trim()
    .uri({
      scheme: ['http', 'https']
    })
    .allow(null, ''),

  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced')
    .default('beginner'),

  price: Joi.number()
    .min(0)
    .max(1000000)
    .default(0)
});

export const updateCourseSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200),

  description: Joi.string()
    .trim()
    .min(20)
    .max(5000),

  category: Joi.string()
    .hex()
    .length(24),

  thumbnail: Joi.string()
    .trim()
    .uri({
      scheme: ['http', 'https']
    })
    .allow(null, ''),

  level: Joi.string()
    .valid('beginner', 'intermediate', 'advanced'),

  price: Joi.number()
    .min(0)
    .max(1000000)
}).min(1);

export const courseIdParamSchema = Joi.object({
  courseId: objectIdSchema
});

export const courseSearchSchema = courseSearchQuerySchema;