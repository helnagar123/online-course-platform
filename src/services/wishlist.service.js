import Wishlist from '../models/Wishlist.js';
import Course from '../models/Course.js';
import AppError from '../utils/AppError.js';

const addToWishlist = async (
  userId,
  courseId
) => {
  const course = await Course.findOne({
    _id: courseId,
    status: 'published'
  });

  if (!course) {
    throw new AppError(
      'Course not found or unavailable',
      404
    );
  }

  if (
    course.instructor.toString() === userId.toString()
  ) {
    throw new AppError(
      'You cannot add your own course to your wishlist',
      400
    );
  }

  const existingItem = await Wishlist.findOne({
    user: userId,
    course: courseId
  });

  if (existingItem) {
    throw new AppError(
      'Course is already in your wishlist',
      409
    );
  }

  const wishlistItem = await Wishlist.create({
    user: userId,
    course: courseId
  });

  return wishlistItem.populate(
    'course',
    'title slug thumbnail price instructor'
  );
};

const getMyWishlist = async (userId) => {
  return Wishlist.find({
    user: userId
  })
    .populate(
      'course',
      'title slug thumbnail price instructor'
    )
    .sort({ createdAt: -1 });
};

const removeFromWishlist = async (
  userId,
  courseId
) => {
  const deletedItem =
    await Wishlist.findOneAndDelete({
      user: userId,
      course: courseId
    });

  if (!deletedItem) {
    throw new AppError(
      'Course is not in your wishlist',
      404
    );
  }
};

export {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist
};