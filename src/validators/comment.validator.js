import Joi from 'joi';
import { objectIdSchema } from './common.validator.js';

export const createCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(2000)
    .required()
});

export const updateCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(1)
    .max(2000)
    .required()
});

export const lessonCommentParamSchema = Joi.object({
  lessonId: objectIdSchema
});

export const commentIdParamSchema = Joi.object({
  commentId: objectIdSchema
});