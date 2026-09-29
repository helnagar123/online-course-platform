import Joi from 'joi';
import { objectIdSchema } from './common.validator.js';

export const createRatingSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  review: Joi.string()
    .trim()
    .max(2000)
    .allow('')
});

export const updateRatingSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5),

  review: Joi.string()
    .trim()
    .max(2000)
    .allow('')
}).min(1);

export const courseRatingParamSchema = Joi.object({
  courseId: objectIdSchema
});

export const ratingIdParamSchema = Joi.object({
  ratingId: objectIdSchema
});