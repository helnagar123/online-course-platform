import { Router } from 'express';

import {
  enroll,
  getById,
  listMine,
  cancel
} from '../controllers/enrollment.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  courseEnrollmentParamSchema,
  enrollmentIdParamSchema
} from '../validators/enrollment.validator.js';

const router = Router();

/**
 * @swagger
 * /courses/{courseId}/enrollments:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll in a course
 *     description: Enroll the authenticated student in a published course.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course MongoDB ObjectId.
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *       400:
 *         description: Invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required
 *       404:
 *         description: Course not found
 *       409:
 *         description: User is already enrolled in the course
 */
router.post(
  '/courses/:courseId/enrollments',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: courseEnrollmentParamSchema
  }),
  enroll
);

/**
 * @swagger
 * /enrollments/me:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get my enrollments
 *     description: Retrieve all courses the authenticated student is enrolled in.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enrollments retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required
 */
router.get(
  '/enrollments/me',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  listMine
);

/**
 * @swagger
 * /enrollments/{enrollmentId}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollment by ID
 *     description: Retrieve a specific enrollment belonging to the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully
 *       400:
 *         description: Invalid enrollment ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or enrollment does not belong to the current user
 *       404:
 *         description: Enrollment not found
 */
router.get(
  '/enrollments/:enrollmentId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: enrollmentIdParamSchema
  }),
  getById
);

/**
 * @swagger
 * /enrollments/{enrollmentId}/cancel:
 *   patch:
 *     tags:
 *       - Enrollments
 *     summary: Cancel an enrollment
 *     description: Cancel an active enrollment belonging to the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Enrollment cancelled successfully
 *       400:
 *         description: Invalid enrollment ID or enrollment cannot be cancelled
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or enrollment does not belong to the current user
 *       404:
 *         description: Enrollment not found
 */
router.patch(
  '/enrollments/:enrollmentId/cancel',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: enrollmentIdParamSchema
  }),
  cancel
);

export default router;