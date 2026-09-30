import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  createCourse,
  getCourseById,
  getCourses,
  getInstructorCourses,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse
} from '../services/course.service.js';

const create = asyncHandler(
  async (req, res) => {
    const course = await createCourse(
      req.user.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Course created successfully',
      data: course
    });
  }
);

const list = asyncHandler(
  async (req, res) => {
    const result = await getCourses(
      req.query
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Courses retrieved successfully',
      data: result.courses,
      meta: result.pagination
    });
  }
);

const getById = asyncHandler(
  async (req, res) => {
    const course = await getCourseById(
      req.params.courseId
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course retrieved successfully',
      data: course
    });
  }
);

const getMine = asyncHandler(
  async (req, res) => {
    const result =
      await getInstructorCourses(
        req.user.id,
        req.query
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Instructor courses retrieved successfully',
      data: result.courses,
      meta: result.pagination
    });
  }
);

const update = asyncHandler(
  async (req, res) => {
    const course = await updateCourse(
      req.params.courseId,
      req.user.id,
      req.body
    );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course updated successfully',
      data: course
    });
  }
);

const publish = asyncHandler(
  async (req, res) => {
    const course =
      await publishCourse(
        req.params.courseId,
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course published successfully',
      data: course
    });
  }
);

const archive = asyncHandler(
  async (req, res) => {
    const course =
      await archiveCourse(
        req.params.courseId,
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course archived successfully',
      data: course
    });
  }
);

const remove = asyncHandler(
  async (req, res) => {
    await deleteCourse(
      req.params.courseId,
      req.user.id
    );

    return res.status(204).send();
  }
);

export {
  create,
  list,
  getById,
  getMine,
  update,
  publish,
  archive,
  remove
};