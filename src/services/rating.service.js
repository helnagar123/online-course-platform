import Rating from '../models/Rating.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import AppError from '../utils/AppError.js';

const createRating = async (
  studentId,
  courseId,
  ratingData
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

  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });

  if (
    !enrollment ||
    !['active', 'completed'].includes(
      enrollment.status
    )
  ) {
    throw new AppError(
      'You must be enrolled in this course to rate it',
      403
    );
  }

  const existingRating = await Rating.findOne({
    user: studentId,
    course: courseId
  });

  if (existingRating) {
    throw new AppError(
      'You have already rated this course',
      409
    );
  }

  return Rating.create({
    user: studentId,
    course: courseId,
    ...ratingData
  });
};

const getCourseRatings = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const [ratings, statistics] = await Promise.all([
    Rating.find({
      course: courseId
    })
      .populate(
        'user',
        'firstName lastName avatar'
      )
      .sort({ createdAt: -1 }),

    Rating.aggregate([
      {
        $match: {
          course: course._id
        }
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: '$rating'
          },
          totalRatings: {
            $sum: 1
          }
        }
      }
    ])
  ]);

  return {
    ratings,
    statistics: statistics[0] || {
      averageRating: 0,
      totalRatings: 0
    }
  };
};

const updateRating = async (
  ratingId,
  userId,
  updateData
) => {
  const rating = await Rating.findOne({
    _id: ratingId,
    user: userId
  });

  if (!rating) {
    throw new AppError(
      'Rating not found or you are not allowed to modify it',
      404
    );
  }

  if (updateData.rating !== undefined) {
    rating.rating = updateData.rating;
  }

  if (updateData.review !== undefined) {
    rating.review = updateData.review;
  }

  await rating.save();

  return rating;
};

const deleteRating = async (
  ratingId,
  userId
) => {
  const rating = await Rating.findOneAndDelete({
    _id: ratingId,
    user: userId
  });

  if (!rating) {
    throw new AppError(
      'Rating not found or you are not allowed to delete it',
      404
    );
  }
};

export {
  createRating,
  getCourseRatings,
  updateRating,
  deleteRating
};