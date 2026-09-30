import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory
} from '../services/category.service.js';

const create = asyncHandler(
  async (req, res) => {
    const category =
      await createCategory(req.body);

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Category created successfully',
      data: category
    });
  }
);

const list = asyncHandler(
  async (req, res) => {
    const categories =
      await getCategories(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Categories retrieved successfully',
      data: categories
    });
  }
);

const getById = asyncHandler(
  async (req, res) => {
    const category =
      await getCategoryById(req.params.categoryId);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Category retrieved successfully',
      data: category
    });
  }
);

const update = asyncHandler(
  async (req, res) => {
    const category =
      await updateCategory(
        req.params.categoryId,
        req.body
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Category updated successfully',
      data: category
    });
  }
);

const deactivate = asyncHandler(
  async (req, res) => {
    const category =
      await deactivateCategory(
        req.params.categoryId
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Category deactivated successfully',
      data: category
    });
  }
);

export {
  create,
  list,
  getById,
  update,
  deactivate
};