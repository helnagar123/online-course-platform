import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist
} from '../services/wishlist.service.js';

const add = asyncHandler(
  async (req, res) => {
    const item =
      await addToWishlist(
        req.user.id,
        req.params.courseId
      );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Course added to wishlist successfully',
      data: item
    });
  }
);

const list = asyncHandler(
  async (req, res) => {
    const wishlist =
      await getMyWishlist(
        req.user.id
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Wishlist retrieved successfully',
      data: wishlist
    });
  }
);

const remove = asyncHandler(
  async (req, res) => {
    await removeFromWishlist(
      req.user.id,
      req.params.courseId
    );

    return res.status(204).send();
  }
);

export {
  add,
  list,
  remove
};