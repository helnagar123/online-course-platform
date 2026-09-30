import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllSessions,
  getCurrentUser
} from '../services/auth.service.js';

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(
    req.body,
    {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    }
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: result
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(
    req.body.email,
    req.body.password,
    {
      userAgent: req.get('user-agent'),
      ipAddress: req.ip
    }
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Login successful',
    data: result
  });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await refreshAccessToken(
    req.body.refreshToken
  );

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Access token refreshed successfully',
    data: result
  });
});

const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.body.refreshToken);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Logout successful'
  });
});

const logoutAll = asyncHandler(async (req, res) => {
  await logoutAllSessions(req.user.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'All sessions have been logged out'
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Current user retrieved successfully',
    data: user
  });
});

export {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe
};