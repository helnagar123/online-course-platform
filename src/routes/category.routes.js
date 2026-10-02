import { Router } from 'express';

import {
  create,
  list,
  getById,
  update,
  deactivate
} from '../controllers/category.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import validate from '../middleware/validation.middleware.js';

import ROLES from '../constants/roles.js';

import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema
} from '../validators/category.validator.js';

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List categories
 *     description: Retrieve the available course categories.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get(
  '/',
  list
);

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID
 *     description: Retrieve a specific category by ID.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       400:
 *         description: Invalid category ID
 *       404:
 *         description: Category not found
 */
router.get(
  '/:categoryId',
  validate({
    params: categoryIdParamSchema
  }),
  getById
);

/**
 * @swagger
 * /categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a category
 *     description: Create a new course category. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       409:
 *         description: Category already exists
 */
router.post(
  '/',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    body: createCategorySchema
  }),
  create
);

/**
 * @swagger
 * /categories/{categoryId}:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Update a category
 *     description: Update an existing category. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       400:
 *         description: Validation failed or invalid category ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category already exists
 */
router.patch(
  '/:categoryId',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: categoryIdParamSchema,
    body: updateCategorySchema
  }),
  update
);

/**
 * @swagger
 * /categories/{categoryId}/deactivate:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Deactivate a category
 *     description: Deactivate a course category. Admin access is required.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category MongoDB ObjectId.
 *     responses:
 *       200:
 *         description: Category deactivated successfully
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Category not found
 */
router.patch(
  '/:categoryId/deactivate',
  authenticate,
  authorizeRoles(ROLES.ADMIN),
  validate({
    params: categoryIdParamSchema
  }),
  deactivate
);

export default router;