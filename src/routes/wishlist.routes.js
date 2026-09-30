import { Router } from 'express';

import {
  add,
  list,
  remove
} from '../controllers/wishlist.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  wishlistCourseParamSchema
} from '../validators/wishlist.validator.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  list
);

router.post(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: wishlistCourseParamSchema
  }),
  add
);

router.delete(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: wishlistCourseParamSchema
  }),
  remove
);

export default router;