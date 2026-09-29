import Joi from 'joi';
import { objectIdSchema } from './common.validator.js';

export const updateLessonProgressSchema = Joi.object({
  completed: Joi.boolean().required()
});

export const lessonProgressParamSchema = Joi.object({
  lessonId: objectIdSchema
});

export const enrollmentProgressParamSchema = Joi.object({
  enrollmentId: objectIdSchema
});