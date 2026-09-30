import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  updateLessonProgress,
  getEnrollmentProgress
} from '../services/progress.service.js';

const updateLesson = asyncHandler(
  async (req, res) => {
    const result =
      await updateLessonProgress(
        req.user.id,
        req.params.lessonId,
        req.body.completed
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Lesson progress updated successfully',
      data: result
    });
  }
);

const getEnrollment = asyncHandler(
  async (req, res) => {
    const result =
      await getEnrollmentProgress(
        req.user.id,
        req.params.enrollmentId
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Enrollment progress retrieved successfully',
      data: result
    });
  }
);

export {
  updateLesson,
  getEnrollment
};