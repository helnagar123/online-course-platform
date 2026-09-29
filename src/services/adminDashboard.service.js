import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import AppError from '../utils/AppError.js';

const getAdminDashboard = async () => {
  const [
    userStatistics,
    courseStatistics,
    enrollmentStatistics,
    topCourses,
    recentEnrollments
  ] = await Promise.all([
    User.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,

                totalUsers: {
                  $sum: 1
                },

                activeUsers: {
                  $sum: {
                    $cond: [
                      '$isActive',
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],

          usersByRole: [
            {
              $group: {
                _id: '$role',
                count: {
                  $sum: 1
                }
              }
            },
            {
              $sort: {
                count: -1
              }
            }
          ]
        }
      }
    ]),

    Course.aggregate([
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
            }
          ],

          coursesByCategory: [
            {
              $lookup: {
                from: 'categories',
                localField: 'category',
                foreignField: '_id',
                as: 'category'
              }
            },
            {
              $unwind: {
                path: '$category',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $group: {
                _id: '$category.name',
                count: {
                  $sum: 1
                }
              }
            },
            {
              $sort: {
                count: -1
              }
            }
          ]
        }
      }
    ]),

    Enrollment.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,

                totalEnrollments: {
                  $sum: 1
                },

                activeEnrollments: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          '$status',
                          'active'
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },

                completedEnrollments: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          '$status',
                          'completed'
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },

                cancelledEnrollments: {
                  $sum: {
                    $cond: [
                      {
                        $eq: [
                          '$status',
                          'cancelled'
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]),

    Course.aggregate([
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
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          status: 1,
          totalStudents: {
            $size: '$enrollments'
          }
        }
      },
      {
        $sort: {
          totalStudents: -1
        }
      },
      {
        $limit: 10
      }
    ]),

    Enrollment.find()
      .populate(
        'student',
        'firstName lastName email'
      )
      .populate(
        'course',
        'title slug'
      )
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  if (
    !userStatistics ||
    !courseStatistics ||
    !enrollmentStatistics
  ) {
    throw new AppError(
      'Admin dashboard data could not be generated',
      500
    );
  }

  return {
    users: {
      overview:
        userStatistics[0]?.overview[0] || {
          totalUsers: 0,
          activeUsers: 0
        },

      byRole:
        userStatistics[0]?.usersByRole || []
    },

    courses: {
      overview:
        courseStatistics[0]?.overview[0] || {
          totalCourses: 0,
          publishedCourses: 0,
          draftCourses: 0,
          archivedCourses: 0
        },

      byCategory:
        courseStatistics[0]?.coursesByCategory || []
    },

    enrollments: {
      overview:
        enrollmentStatistics[0]?.overview[0] || {
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          cancelledEnrollments: 0
        }
    },

    topCourses,

    recentEnrollments
  };
};

export default getAdminDashboard;