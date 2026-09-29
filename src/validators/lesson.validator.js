import Joi from 'joi';
import { objectIdSchema } from './common.validator.js';

export const createLessonSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required(),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow(''),

  content: Joi.string()
    .trim()
    .allow(''),

  videoUrl: Joi.string()
    .trim()
    .uri({
      scheme: ['http', 'https']
    })
    .allow(null, ''),

  duration: Joi.number()
    .min(0)
    .max(100000)
    .default(0),

  order: Joi.number()
    .integer()
    .min(1)
    .required()
});

export const updateLessonSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(200),

  description: Joi.string()
    .trim()
    .max(1000)
    .allow(''),

  content: Joi.string()
    .trim()
    .allow(''),

  videoUrl: Joi.string()
    .trim()
    .uri({
      scheme: ['http', 'https']
    })
    .allow(null, ''),

  duration: Joi.number()
    .min(0)
    .max(100000),

  order: Joi.number()
    .integer()
    .min(1)
}).min(1);

export const courseLessonsParamSchema = Joi.object({
  courseId: objectIdSchema
});

export const lessonIdParamSchema = Joi.object({
  lessonId: objectIdSchema
});