import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import getAdminDashboard from
  '../services/adminDashboard.service.js';

const getDashboard = asyncHandler(
  async (req, res) => {
    const dashboard =
      await getAdminDashboard();

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Admin dashboard retrieved successfully',
      data: dashboard
    });
  }
);

export {
  getDashboard
};