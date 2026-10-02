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

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get current user profile
 *     description: Retrieve the profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.get(
  '/me',
  authenticate,
  getCurrentProfile
);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update current user profile
 *     description: Update the profile of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User not found
 */
router.patch(
  '/me',
  authenticate,
  validate({
    body: updateProfileSchema
  }),
  updateCurrentProfile
);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List users
 *     description: Retrieve a paginated list of users. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by user name or email.
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum:
 *             - admin
 *             - instructor
 *             - student
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - createdAt
 *             - firstName
 *             - lastName
 *             - email
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *           default: desc
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    query: userListQuerySchema
  }),
  listUsers
);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
router.get(
  '/:userId',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: userIdParamSchema
  }),
  getUser
);

/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update a user's role or active status. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminUpdateUserRequest'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation failed or invalid user ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
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

/**
 * @swagger
 * /users/{userId}/deactivate:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Deactivate user account
 *     description: Deactivate a user account. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       400:
 *         description: Invalid user ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: User not found
 */
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