import { Router } from 'express';

import {
  create,
  list,
  getById,
  getMine,
  update,
  publish,
  archive,
  remove
} from '../controllers/course.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createCourseSchema,
  updateCourseSchema,
  courseIdParamSchema,
  courseSearchSchema
} from '../validators/course.validator.js';

const router = Router();

/**
 * @swagger
 * /courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: List courses
 *     description: Retrieve published courses with optional search, filtering, pagination, and sorting.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses by title or description.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter courses by category ID.
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum:
 *             - beginner
 *             - intermediate
 *             - advanced
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *             - archived
 *         description: Filter courses by status.
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *         description: Filter courses by instructor ID.
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
 *             - title
 *             - price
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
 *         description: Courses retrieved successfully
 *       400:
 *         description: Validation failed
 */
router.get(
  '/',
  validate({
    query: courseSearchSchema
  }),
  list
);

/**
 * @swagger
 * /courses/mine:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get instructor courses
 *     description: Retrieve courses created by the authenticated instructor.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses by title or description.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter courses by category ID.
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum:
 *             - beginner
 *             - intermediate
 *             - advanced
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - draft
 *             - published
 *             - archived
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
 *     responses:
 *       200:
 *         description: Instructor courses retrieved successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required
 */
router.get(
  '/mine',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    query: courseSearchSchema
  }),
  getMine
);

/**
 * @swagger
 * /courses/{courseId}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get course by ID
 *     description: Retrieve a course by its ID.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       400:
 *         description: Invalid course ID
 *       404:
 *         description: Course not found
 */
router.get(
  '/:courseId',
  validate({
    params: courseIdParamSchema
  }),
  getById
);

/**
 * @swagger
 * /courses:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Create a course
 *     description: Create a new course. Instructor access is required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Course with the same slug already exists
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    body: createCourseSchema
  }),
  create
);

/**
 * @swagger
 * /courses/{courseId}:
 *   patch:
 *     tags:
 *       - Courses
 *     summary: Update a course
 *     description: Update a course owned by the authenticated instructor.
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
 *             $ref: '#/components/schemas/UpdateCourseRequest'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Validation failed or invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or course ownership required
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course with the same slug already exists
 */
router.patch(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema,
    body: updateCourseSchema
  }),
  update
);

/**
 * @swagger
 * /courses/{courseId}/publish:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Publish a course
 *     description: Publish a course owned by the authenticated instructor.
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
 *       200:
 *         description: Course published successfully
 *       400:
 *         description: Invalid course ID or course cannot be published
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or course ownership required
 *       404:
 *         description: Course not found
 */
router.post(
  '/:courseId/publish',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema
  }),
  publish
);

/**
 * @swagger
 * /courses/{courseId}/archive:
 *   post:
 *     tags:
 *       - Courses
 *     summary: Archive a course
 *     description: Archive a course owned by the authenticated instructor.
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
 *       200:
 *         description: Course archived successfully
 *       400:
 *         description: Invalid course ID or course cannot be archived
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or course ownership required
 *       404:
 *         description: Course not found
 */
router.post(
  '/:courseId/archive',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema
  }),
  archive
);

/**
 * @swagger
 * /courses/{courseId}:
 *   delete:
 *     tags:
 *       - Courses
 *     summary: Delete a course
 *     description: Delete a course owned by the authenticated instructor.
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
 *       200:
 *         description: Course deleted successfully
 *       400:
 *         description: Invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Instructor role required or course ownership required
 *       404:
 *         description: Course not found
 */
router.delete(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  validate({
    params: courseIdParamSchema
  }),
  remove
);

export default router;