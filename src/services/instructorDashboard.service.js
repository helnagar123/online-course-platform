import mongoose from 'mongoose';
import Course from '../models/Course.js';
import AppError from '../utils/AppError.js';

const getInstructorDashboard = async (
  instructorId
) => {
  const instructorObjectId =
    new mongoose.Types.ObjectId(instructorId);

  const [result] = await Course.aggregate([
    {
      $match: {
        instructor: instructorObjectId
      }
    },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,

              totalCourses: {
                $sum: 1
              },

              publishedCourses: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        '$status',
                        'published'
                      ]
                    },
                    1,
                    0
                  ]
                }
              },

              draftCourses: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        '$status',
                        'draft'
                      ]
                    },
                    1,
                    0
                  ]
                }
              },

              archivedCourses: {
                $sum: {
                  $cond: [
                    {
                      $eq: [
                        '$status',
                        'archived'
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          },
          {
            $project: {
              _id: 0
            }
          }
        ],

        coursePerformance: [
          {
            $lookup: {
              from: 'enrollments',
              let: {
                courseId: '$_id'
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: [
                            '$course',
                            '$$courseId'
                          ]
                        },
                        {
                          $in: [
                            '$status',
                            [
                              'active',
                              'completed'
                            ]
                          ]
                        }
                      ]
                    }
                  }
                }
              ],
              as: 'enrollments'
            }
          },

          {
            $lookup: {
              from: 'ratings',
              localField: '_id',
              foreignField: 'course',
              as: 'ratings'
            }
          },

          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              status: 1,
              price: 1,
              createdAt: 1,

              totalStudents: {
                $size: '$enrollments'
              },

              averageRating: {
                $round: [
                  {
                    $ifNull: [
                      {
                        $avg: '$ratings.rating'
                      },
                      0
                    ]
                  },
                  2
                ]
              },

              totalRatings: {
                $size: '$ratings'
              }
            }
          },

          {
            $sort: {
              totalStudents: -1,
              averageRating: -1
            }
          }
        ]
      }
    }
  ]);

  if (!result) {
    throw new AppError(
      'Instructor dashboard data could not be generated',
      500
    );
  }

  return {
    overview:
      result.overview[0] || {
        totalCourses: 0,
        publishedCourses: 0,
        draftCourses: 0,
        archivedCourses: 0
      },

    coursePerformance:
      result.coursePerformance
  };
};

export default getInstructorDashboard;