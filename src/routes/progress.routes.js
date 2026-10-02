import { Router } from 'express';

import {
  updateLesson,
  getEnrollment
} from '../controllers/progress.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  updateLessonProgressSchema,
  lessonProgressParamSchema,
  enrollmentProgressParamSchema
} from '../validators/progress.validator.js';

const router = Router();

/**
 * @swagger
 * /lessons/{lessonId}/progress:
 *   patch:
 *     tags:
 *       - Progress
 *     summary: Update lesson progress
 *     description: Update the completion status of a lesson for the authenticated student's enrollment.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLessonProgressRequest'
 *     responses:
 *       200:
 *         description: Lesson progress updated successfully
 *       400:
 *         description: Validation failed or invalid lesson ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or lesson is not accessible
 *       404:
 *         description: Lesson or enrollment not found
 */
router.patch(
  '/lessons/:lessonId/progress',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: lessonProgressParamSchema,
    body: updateLessonProgressSchema
  }),
  updateLesson
);

/**
 * @swagger
 * /enrollments/{enrollmentId}/progress:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get enrollment progress
 *     description: Retrieve lesson progress for an enrollment belonging to the authenticated student.
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
 *         description: Enrollment progress retrieved successfully
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
  '/enrollments/:enrollmentId/progress',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: enrollmentProgressParamSchema
  }),
  getEnrollment
);

export default router;