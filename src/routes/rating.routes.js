import { Router } from 'express';

import {
  create,
  list,
  update,
  remove
} from '../controllers/rating.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createRatingSchema,
  updateRatingSchema,
  courseRatingParamSchema,
  ratingIdParamSchema
} from '../validators/rating.validator.js';

const router = Router();

router.get(
  '/courses/:courseId/ratings',
  validate({
    params: courseRatingParamSchema
  }),
  list
);

router.post(
  '/courses/:courseId/ratings',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: courseRatingParamSchema,
    body: createRatingSchema
  }),
  create
);

router.patch(
  '/ratings/:ratingId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: ratingIdParamSchema,
    body: updateRatingSchema
  }),
  update
);

router.delete(
  '/ratings/:ratingId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: ratingIdParamSchema
  }),
  remove
);

export default router;