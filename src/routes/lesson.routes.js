import { Router } from 'express';

import {
  create,
  list,
  getById,
  update,
  publish,
  remove
} from '../controllers/lesson.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createLessonSchema,
  updateLessonSchema,
  courseLessonsParamSchema,
  lessonIdParamSchema
} from '../validators/lesson.validator.js';

const router = Router();

/**
 * @swagger
 * /courses/{courseId}/lessons:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: List course lessons
 *     description: Retrieve the lessons of a course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
 *       400:
 *         description: Invalid course ID
 *       404:
 *         description: Course not found
 */
router.get(
  '/courses/:courseId/lessons',
  validate({
    params: courseLessonsParamSchema
  }),
  list
);

/**
 * @swagger
 * /courses/{courseId}/lessons:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Create a lesson
 *     description: Create a new lesson inside a course. Instructor access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLessonRequest'
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Validation failed or invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or course ownership required
 *       404:
 *         description: Course not found
 *       409:
 *         description: Lesson order already exists
 */
router.post(
  '/courses/:courseId/lessons',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseLessonsParamSchema,
    body: createLessonSchema
  }),
  create
);

/**
 * @swagger
 * /lessons/{lessonId}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get lesson by ID
 *     description: Retrieve a lesson by its ID.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
 *       400:
 *         description: Invalid lesson ID
 *       404:
 *         description: Lesson not found
 */
router.get(
  '/lessons/:lessonId',
  validate({
    params: lessonIdParamSchema
  }),
  getById
);

/**
 * @swagger
 * /lessons/{lessonId}:
 *   patch:
 *     tags:
 *       - Lessons
 *     summary: Update a lesson
 *     description: Update a lesson owned by the authenticated instructor.
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
 *             $ref: '#/components/schemas/UpdateLessonRequest'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       400:
 *         description: Validation failed or invalid lesson ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or lesson ownership required
 *       404:
 *         description: Lesson not found
 *       409:
 *         description: Lesson order already exists
 */
router.patch(
  '/lessons/:lessonId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: lessonIdParamSchema,
    body: updateLessonSchema
  }),
  update
);

/**
 * @swagger
 * /lessons/{lessonId}/publish:
 *   post:
 *     tags:
 *       - Lessons
 *     summary: Publish a lesson
 *     description: Publish a lesson owned by the authenticated instructor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Lesson published successfully
 *       400:
 *         description: Invalid lesson ID or lesson cannot be published
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or lesson ownership required
 *       404:
 *         description: Lesson not found
 */
router.post(
  '/lessons/:lessonId/publish',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: lessonIdParamSchema
  }),
  publish
);

/**
 * @swagger
 * /lessons/{lessonId}:
 *   delete:
 *     tags:
 *       - Lessons
 *     summary: Delete a lesson
 *     description: Delete a lesson owned by the authenticated instructor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson MongoDB ObjectId.
 *     responses:
 *       204:
 *         description: Lesson deleted successfully
 *       400:
 *         description: Invalid lesson ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or lesson ownership required
 *       404:
 *         description: Lesson not found
 */
router.delete(
  '/lessons/:lessonId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: lessonIdParamSchema
  }),
  remove
);

export default router;