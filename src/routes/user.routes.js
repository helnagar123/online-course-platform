import { Router } from 'express';

import {
  getCurrentProfile,
  getUser,
  listUsers,
  updateCurrentProfile,
  updateUser,
  deactivateUserAccount
} from '../controllers/user.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  updateProfileSchema,
  adminUpdateUserSchema,
  userIdParamSchema,
  userListQuerySchema
} from '../validators/user.validator.js';

const router = Router();

router.get(
  '/me',
  authenticate,
  getCurrentProfile
);

router.patch(
  '/me',
  authenticate,
  validate({
    body: updateProfileSchema
  }),
  updateCurrentProfile
);

router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    query: userListQuerySchema
  }),
  listUsers
);

router.get(
  '/:userId',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: userIdParamSchema
  }),
  getUser
);

router.patch(
  '/:userId',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: userIdParamSchema,
    body: adminUpdateUserSchema
  }),
  updateUser
);

router.patch(
  '/:userId/deactivate',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: userIdParamSchema
  }),
  deactivateUserAccount
);

export default router;