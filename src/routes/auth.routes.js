import { Router } from 'express';

import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe
} from '../controllers/auth.controller.js';

import authenticate from '../middleware/auth.middleware.js';

import validate from '../middleware/validation.middleware.js';

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema
} from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/register',
  validate({
    body: registerSchema
  }),
  register
);

router.post(
  '/login',
  validate({
    body: loginSchema
  }),
  login
);

router.post(
  '/refresh',
  validate({
    body: refreshTokenSchema
  }),
  refresh
);

router.post(
  '/logout',
  validate({
    body: logoutSchema
  }),
  logout
);

router.post(
  '/logout-all',
  authenticate,
  logoutAll
);

router.get(
  '/me',
  authenticate,
  getMe
);

export default router;