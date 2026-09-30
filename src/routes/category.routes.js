import { Router } from 'express';

import {
  create,
  list,
  getById,
  update,
  deactivate
} from '../controllers/category.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema
} from '../validators/category.validator.js';

const router = Router();

router.get(
  '/',
  list
);

router.get(
  '/:categoryId',
  validate({
    params: categoryIdParamSchema
  }),
  getById
);

router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    body: createCategorySchema
  }),
  create
);

router.patch(
  '/:categoryId',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: categoryIdParamSchema,
    body: updateCategorySchema
  }),
  update
);

router.patch(
  '/:categoryId/deactivate',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: categoryIdParamSchema
  }),
  deactivate
);

export default router;