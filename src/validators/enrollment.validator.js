import Joi from 'joi';
import { objectIdSchema } from './common.validator.js';

export const courseEnrollmentParamSchema = Joi.object({
  courseId: objectIdSchema
});

export const enrollmentIdParamSchema = Joi.object({
  enrollmentId: objectIdSchema
});