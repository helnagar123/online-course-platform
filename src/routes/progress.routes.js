import { Router } from 'express';

import {
  updateLesson,
  getEnrollment
} from '../controllers/progress.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  updateLessonProgressSchema,
  lessonProgressParamSchema,
  enrollmentProgressParamSchema
} from '../validators/progress.validator.js';

const router = Router();

router.patch(
  '/lessons/:lessonId/progress',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: lessonProgressParamSchema,
    body: updateLessonProgressSchema
  }),
  updateLesson
);

router.get(
  '/enrollments/:enrollmentId/progress',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: enrollmentProgressParamSchema
  }),
  getEnrollment
);

export default router;