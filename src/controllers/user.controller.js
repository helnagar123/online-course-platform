import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  getUserById,
  getUsers,
  updateProfile,
  updateUserByAdmin,
  deactivateUser
} from '../services/user.service.js';

const getCurrentProfile = asyncHandler(
  async (req, res) => {
    const user = await getUserById(req.user.id);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: user
    });
  }
);

const getUser = asyncHandler(
  async (req, res) => {
    const user = await getUserById(
      req.params.userId
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user
    });
  }
);

const listUsers = asyncHandler(
  async (req, res) => {
    const result = await getUsers(req.query);

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: result.users,
      meta: result.pagination
    });
  }
);

const updateCurrentProfile = asyncHandler(
  async (req, res) => {
    const user = await updateProfile(
      req.user.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Profile updated successfully',
      data: user
    });
  }
);

const updateUser = asyncHandler(
  async (req, res) => {
    const user = await updateUserByAdmin(
      req.params.userId,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User updated successfully',
      data: user
    });
  }
);

const deactivateUserAccount = asyncHandler(
  async (req, res) => {
    const user = await deactivateUser(
      req.params.userId
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'User deactivated successfully',
      data: user
    });
  }
);

export {
  getCurrentProfile,
  getUser,
  listUsers,
  updateCurrentProfile,
  updateUser,
  deactivateUserAccount
};