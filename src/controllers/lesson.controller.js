import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  publishLesson,
  deleteLesson
} from '../services/lesson.service.js';

const create = asyncHandler(
  async (req, res) => {
    const lesson = await createLesson(
      req.params.courseId,
      req.user.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Lesson created successfully',
      data: lesson
    });
  }
);

const list = asyncHandler(
  async (req, res) => {
    const lessons =
      await getCourseLessons(
        req.params.courseId
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Lessons retrieved successfully',
      data: lessons
    });
  }
);

const getById = asyncHandler(
  async (req, res) => {
    const lesson = await getLessonById(
      req.params.lessonId
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Lesson retrieved successfully',
      data: lesson
    });
  }
);

const update = asyncHandler(
  async (req, res) => {
    const lesson = await updateLesson(
      req.params.lessonId,
      req.user.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Lesson updated successfully',
      data: lesson
    });
  }
);

const publish = asyncHandler(
  async (req, res) => {
    const lesson = await publishLesson(
      req.params.lessonId,
      req.user.id
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Lesson published successfully',
      data: lesson
    });
  }
);

const remove = asyncHandler(
  async (req, res) => {
    await deleteLesson(
      req.params.lessonId,
      req.user.id
    );

    return res.status(204).send();
  }
);

export {
  create,
  list,
  getById,
  update,
  publish,
  remove
};