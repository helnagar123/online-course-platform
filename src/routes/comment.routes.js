import { Router } from 'express';

import {
  create,
  list,
  getById,
  update,
  remove
} from '../controllers/comment.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createCommentSchema,
  updateCommentSchema,
  lessonCommentParamSchema,
  commentIdParamSchema
} from '../validators/comment.validator.js';

const router = Router();

router.get(
  '/lessons/:lessonId/comments',
  validate({
    params: lessonCommentParamSchema
  }),
  list
);

router.post(
  '/lessons/:lessonId/comments',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: lessonCommentParamSchema,
    body: createCommentSchema
  }),
  create
);

router.get(
  '/comments/:commentId',
  validate({
    params: commentIdParamSchema
  }),
  getById
);

router.patch(
  '/comments/:commentId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: commentIdParamSchema,
    body: updateCommentSchema
  }),
  update
);

router.delete(
  '/comments/:commentId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: commentIdParamSchema
  }),
  remove
);

export default router;