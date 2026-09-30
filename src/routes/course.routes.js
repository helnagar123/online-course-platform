import { Router } from 'express';

import {
  create,
  list,
  getById,
  getMine,
  update,
  publish,
  archive,
  remove
} from '../controllers/course.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  courseSearchSchema
} from '../validators/course.validator.js';

const router = Router();

router.get(
  '/',
  validate({
    query: courseSearchSchema
  }),
  list
);

router.get(
  '/mine',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    query: courseSearchSchema
  }),
  getMine
);

router.get(
  '/:courseId',
  validate({
    params: courseIdParamSchema
  }),
  getById
);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    body: createCourseSchema
  }),
  create
);

router.patch(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema,
    body: updateCourseSchema
  }),
  update
);

router.post(
  '/:courseId/publish',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema
  }),
  publish
);

router.post(
  '/:courseId/archive',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema
  }),
  archive
);

router.delete(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema
  }),
  remove
);

export default router;