import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  createRating,
  getCourseRatings,
  updateRating,
  deleteRating
} from '../services/rating.service.js';

const create = asyncHandler(
  async (req, res) => {
    const rating =
      await createRating(
        req.user.id,
        req.params.courseId,
        req.body
      );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Rating created successfully',
      data: rating
    });
  }
);

const list = asyncHandler(
  async (req, res) => {
    const result =
      await getCourseRatings(
        req.params.courseId
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Course ratings retrieved successfully',
      data: result.ratings,
      meta: result.statistics
    });
  }
);

const update = asyncHandler(
  async (req, res) => {
    const rating =
      await updateRating(
        req.params.ratingId,
        req.user.id,
        req.body
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Rating updated successfully',
      data: rating
    });
  }
);

const remove = asyncHandler(
  async (req, res) => {
    await deleteRating(
      req.params.ratingId,
      req.user.id
    );

    return res.status(204).send();
  }
);

export {
  create,
  list,
  update,
  remove
};