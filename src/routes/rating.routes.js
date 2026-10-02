import { Router } from 'express';

import {
  create,
  list,
  update,
  remove
} from '../controllers/rating.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createRatingSchema,
  updateRatingSchema,
  courseRatingParamSchema,
  ratingIdParamSchema
} from '../validators/rating.validator.js';

const router = Router();

/**
 * @swagger
 * /courses/{courseId}/ratings:
 *   get:
 *     tags:
 *       - Ratings
 *     summary: List course ratings
 *     description: Retrieve all ratings for a course along with rating statistics.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Course ratings retrieved successfully
 *       400:
 *         description: Invalid course ID
 *       404:
 *         description: Course not found
 */
router.get(
  '/courses/:courseId/ratings',
  validate({
    params: courseRatingParamSchema
  }),
  list
);

/**
 * @swagger
 * /courses/{courseId}/ratings:
 *   post:
 *     tags:
 *       - Ratings
 *     summary: Create a course rating
 *     description: Rate a course as an enrolled student.
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
 *             $ref: '#/components/schemas/CreateRatingRequest'
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Validation failed or invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or user is not enrolled
 *       404:
 *         description: Course not found
 *       409:
 *         description: User has already rated this course
 */
router.post(
  '/courses/:courseId/ratings',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: courseRatingParamSchema,
    body: createRatingSchema
  }),
  create
);

/**
 * @swagger
 * /ratings/{ratingId}:
 *   patch:
 *     tags:
 *       - Ratings
 *     summary: Update a rating
 *     description: Update a rating owned by the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRatingRequest'
 *     responses:
 *       200:
 *         description: Rating updated successfully
 *       400:
 *         description: Validation failed or invalid rating ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or rating ownership required
 *       404:
 *         description: Rating not found
 */
router.patch(
  '/ratings/:ratingId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: ratingIdParamSchema,
    body: updateRatingSchema
  }),
  update
);

/**
 * @swagger
 * /ratings/{ratingId}:
 *   delete:
 *     tags:
 *       - Ratings
 *     summary: Delete a rating
 *     description: Delete a rating owned by the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ratingId
 *         required: true
 *         schema:
 *           type: string
 *         description: Rating MongoDB ObjectId.
 *     responses:
 *       204:
 *         description: Rating deleted successfully
 *       400:
 *         description: Invalid rating ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or rating ownership required
 *       404:
 *         description: Rating not found
 */
router.delete(
  '/ratings/:ratingId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: ratingIdParamSchema
  }),
  remove
);

export default router;