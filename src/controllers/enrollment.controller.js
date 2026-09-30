import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  enrollInCourse,
  getEnrollmentById,
  getMyEnrollments,
  cancelEnrollment
} from '../services/enrollment.service.js';

const enroll = asyncHandler(
  async (req, res) => {
    const enrollment =
      await enrollInCourse(
        req.user.id,
        req.params.courseId
      );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Enrollment created successfully',
      data: enrollment
    });
  }
);

const getById = asyncHandler(
  async (req, res) => {
    const enrollment =
      await getEnrollmentById(
        req.params.enrollmentId,
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Enrollment retrieved successfully',
      data: enrollment
    });
  }
);

const listMine = asyncHandler(
  async (req, res) => {
    const enrollments =
      await getMyEnrollments(
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Enrollments retrieved successfully',
      data: enrollments
    });
  }
);

const cancel = asyncHandler(
  async (req, res) => {
    const enrollment =
      await cancelEnrollment(
        req.params.enrollmentId,
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Enrollment cancelled successfully',
      data: enrollment
    });
  }
);

export {
  enroll,
  getById,
  listMine,
  cancel
};