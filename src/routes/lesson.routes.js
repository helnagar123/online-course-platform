import { Router } from 'express';

import {
  create,
  list,
  getById,
  update,
  publish,
  remove
} from '../controllers/lesson.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createLessonSchema,
  updateLessonSchema,
  courseLessonsParamSchema,
  lessonIdParamSchema
} from '../validators/lesson.validator.js';

const router = Router();

router.get(
  '/courses/:courseId/lessons',
  validate({
    params: courseLessonsParamSchema
  }),
  list
);

router.post(
  '/courses/:courseId/lessons',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseLessonsParamSchema,
    body: createLessonSchema
  }),
  create
);

router.get(
  '/lessons/:lessonId',
  validate({
    params: lessonIdParamSchema
  }),
  getById
);

router.patch(
  '/lessons/:lessonId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: lessonIdParamSchema,
    body: updateLessonSchema
  }),
  update
);

router.post(
  '/lessons/:lessonId/publish',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: lessonIdParamSchema
  }),
  publish
);

router.delete(
  '/lessons/:lessonId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: lessonIdParamSchema
  }),
  remove
);

export default router;