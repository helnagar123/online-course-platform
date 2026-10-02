import { Router } from 'express';

import {
  add,
  list,
  remove
} from '../controllers/wishlist.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  wishlistCourseParamSchema
} from '../validators/wishlist.validator.js';

const router = Router();

/**
 * @swagger
 * /wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get my wishlist
 *     description: Retrieve all courses in the authenticated student's wishlist.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required
 */
router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  list
);

/**
 * @swagger
 * /wishlist/{courseId}:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add course to wishlist
 *     description: Add a course to the authenticated student's wishlist.
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
 *         description: Course added to wishlist successfully
 *       400:
 *         description: Invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required
 *       404:
 *         description: Course not found
 *       409:
 *         description: Course already exists in wishlist
 */
router.post(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: wishlistCourseParamSchema
  }),
  add
);

/**
 * @swagger
 * /wishlist/{courseId}:
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove course from wishlist
 *     description: Remove a course from the authenticated student's wishlist.
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
 *       204:
 *         description: Course removed from wishlist successfully
 *       400:
 *         description: Invalid course ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Student role required
 *       404:
 *         description: Wishlist item not found
 */
router.delete(
  '/:courseId',
  authenticate,
  authorizeRoles(ROLES.STUDENT),
  validate({
    params: wishlistCourseParamSchema
  }),
  remove
);

export default router;