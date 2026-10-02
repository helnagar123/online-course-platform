import { Router } from 'express';

import {
  getDashboard
} from '../controllers/instructorDashboard.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import ROLES from '../constants/roles.js';

const router = Router();

/**
 * @swagger
 * /instructor-dashboard:
 *   get:
 *     tags:
 *       - Instructor Dashboard
 *     summary: Get instructor dashboard
 *     description: Retrieve dashboard statistics and data for the authenticated instructor.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor dashboard retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required
 *       404:
 *         description: Instructor data not found
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  getDashboard
);

export default router;