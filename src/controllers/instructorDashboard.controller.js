import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import getInstructorDashboard from
  '../services/instructorDashboard.service.js';

const getDashboard = asyncHandler(
  async (req, res) => {
    const dashboard =
      await getInstructorDashboard(
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Instructor dashboard retrieved successfully',
      data: dashboard
    });
  }
);

export {
  getDashboard
};