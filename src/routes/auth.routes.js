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

import {
  authRateLimiter
} from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate({
    body: registerSchema
  }),
  register
);

router.post(
  '/login',
  authRateLimiter,
  validate({
    body: loginSchema
  }),
  login
);

router.post(
  '/refresh',
  authRateLimiter,
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