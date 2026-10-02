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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: Create a new user account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  authRateLimiter,
  validate({
    body: registerSchema
  }),
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     description: Authenticate a user and return access and refresh tokens.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  authRateLimiter,
  validate({
    body: loginSchema
  }),
  login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  authRateLimiter,
  validate({
    body: refreshTokenSchema
  }),
  refresh
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout from current session
 *     description: Revoke the provided refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogoutRequest'
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/logout',
  validate({
    body: logoutSchema
  }),
  logout
);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout from all sessions
 *     description: Revoke all active sessions for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions have been logged out
 *       401:
 *         description: Authentication required
 */
router.post(
  '/logout-all',
  authenticate,
  logoutAll
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current authenticated user
 *     description: Retrieve the profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get(
  '/me',
  authenticate,
  getMe
);

export default router;