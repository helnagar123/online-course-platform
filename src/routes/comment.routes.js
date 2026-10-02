import { Router } from 'express';

import {
  create,
  list,
  getById,
  update,
  remove
} from '../controllers/comment.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createCommentSchema,
  updateCommentSchema,
  lessonCommentParamSchema,
  commentIdParamSchema
} from '../validators/comment.validator.js';

const router = Router();

/**
 * @swagger
 * /lessons/{lessonId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: List lesson comments
 *     description: Retrieve all comments for a lesson.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       400:
 *         description: Invalid lesson ID
 *       404:
 *         description: Lesson not found
 */
router.get(
  '/lessons/:lessonId/comments',
  validate({
    params: lessonCommentParamSchema
  }),
  list
);

/**
 * @swagger
 * /lessons/{lessonId}/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a comment
 *     description: Add a comment to a lesson. Student access is required and the student must be enrolled in the course.
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
 *             $ref: '#/components/schemas/CreateCommentRequest'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation failed or invalid lesson ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or user is not enrolled
 *       404:
 *         description: Lesson not found
 */
router.post(
  '/lessons/:lessonId/comments',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: lessonCommentParamSchema,
    body: createCommentSchema
  }),
  create
);

/**
 * @swagger
 * /comments/{commentId}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comment by ID
 *     description: Retrieve a comment by its ID.
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *       400:
 *         description: Invalid comment ID
 *       404:
 *         description: Comment not found
 */
router.get(
  '/comments/:commentId',
  validate({
    params: commentIdParamSchema
  }),
  getById
);

/**
 * @swagger
 * /comments/{commentId}:
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Update a comment
 *     description: Update a comment owned by the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentRequest'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       400:
 *         description: Validation failed or invalid comment ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or comment ownership required
 *       404:
 *         description: Comment not found
 */
router.patch(
  '/comments/:commentId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: commentIdParamSchema,
    body: updateCommentSchema
  }),
  update
);

/**
 * @swagger
 * /comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete a comment
 *     description: Delete a comment owned by the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment MongoDB ObjectId.
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *       400:
 *         description: Invalid comment ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required or comment ownership required
 *       404:
 *         description: Comment not found
 */
router.delete(
  '/comments/:commentId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: commentIdParamSchema
  }),
  remove
);

export default router;