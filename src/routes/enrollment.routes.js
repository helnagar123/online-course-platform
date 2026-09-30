import { Router } from 'express';

import {
  enroll,
  getById,
  listMine,
  cancel
} from '../controllers/enrollment.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  courseEnrollmentParamSchema,
  enrollmentIdParamSchema
} from '../validators/enrollment.validator.js';

const router = Router();

router.post(
  '/courses/:courseId/enrollments',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: courseEnrollmentParamSchema
  }),
  enroll
);

router.get(
  '/enrollments/me',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  listMine
);

router.get(
  '/enrollments/:enrollmentId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: enrollmentIdParamSchema
  }),
  getById
);

router.patch(
  '/enrollments/:enrollmentId/cancel',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: enrollmentIdParamSchema
  }),
  cancel
);

export default router;