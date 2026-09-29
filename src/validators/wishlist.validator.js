import Joi from 'joi';
import { objectIdSchema } from './common.validator.js';

export const wishlistCourseParamSchema = Joi.object({
  courseId: objectIdSchema
});