import { Router } from 'express';

import {
  getDashboard
} from '../controllers/adminDashboard.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import ROLES from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /admin-dashboard:
 *   get:
 *     tags:
 *       - Admin Dashboard
 *     summary: Get admin dashboard
 *     description: Retrieve dashboard statistics and data for the authenticated admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  getDashboard
);

export default router;