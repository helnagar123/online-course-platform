import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',

    info: {
      title: 'Online Course Platform API',
      version: '1.0.0',
      description:
        'RESTful API for the Online Course Platform'
    },

    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local API server'
      }
    ],

    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Categories',
        description: 'Course category endpoints'
      },
      {
        name: 'Courses',
        description: 'Course management endpoints'
      },
      {
        name: 'Lessons',
        description: 'Lesson management endpoints'
      },
      {
        name: 'Enrollments',
        description: 'Course enrollment endpoints'
      },
      {
        name: 'Comments',
        description: 'Lesson comment endpoints'
      },
      {
        name: 'Ratings',
        description: 'Course rating endpoints'
      },
      {
        name: 'Progress',
        description: 'Lesson progress endpoints'
      },
      {
        name: 'Wishlist',
        description: 'Course wishlist endpoints'
      },
      {
        name: 'Instructor Dashboard',
        description: 'Instructor dashboard endpoints'
      },
      {
        name: 'Admin Dashboard',
        description: 'Admin dashboard endpoints'
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },

      schemas: {
        // ==========================================
        // COMMON
        // ==========================================

        ApiSuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success'
            },

            message: {
              type: 'string',
              example: 'Request successful'
            },

            data: {
              nullable: true
            },

            meta: {
              nullable: true
            }
          },
          required: [
            'status',
            'message',
            'data'
          ]
        },

        ApiErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error'
            },

            message: {
              type: 'string',
              example: 'Validation failed'
            },

            errors: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string'
                  },

                  value: {}
                }
              }
            },

            stack: {
              type: 'string',
              nullable: true
            }
          },
          required: [
            'status',
            'message'
          ]
        },

        PaginationMeta: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1
            },

            limit: {
              type: 'integer',
              example: 10
            },

            totalCourses: {
              type: 'integer',
              example: 25,
              nullable: true
            },

            totalUsers: {
              type: 'integer',
              example: 100,
              nullable: true
            },

            totalPages: {
              type: 'integer',
              example: 3
            },

            hasNextPage: {
              type: 'boolean',
              example: true
            },

            hasPreviousPage: {
              type: 'boolean',
              example: false
            }
          }
        },

        ObjectId: {
          type: 'string',
          pattern: '^[a-fA-F0-9]{24}$',
          example: '68d123456789012345678901'
        },

        // ==========================================
        // AUTH
        // ==========================================

        RegisterRequest: {
          type: 'object',
          required: [
            'firstName',
            'lastName',
            'email',
            'password'
          ],
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Hassan'
            },

            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Elnagar'
            },

            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
              example: 'hassan@example.com'
            },

            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              maxLength: 72,
              example: 'Password123'
            },

            role: {
              type: 'string',
              enum: [
                'student',
                'instructor'
              ],
              default: 'student',
              example: 'student'
            }
          }
        },

        LoginRequest: {
          type: 'object',
          required: [
            'email',
            'password'
          ],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'hassan@example.com'
            },

            password: {
              type: 'string',
              format: 'password',
              example: 'Password123'
            }
          }
        },

        RefreshTokenRequest: {
          type: 'object',
          required: [
            'refreshToken'
          ],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'refresh-token-value'
            }
          }
        },

        LogoutRequest: {
          type: 'object',
          required: [
            'refreshToken'
          ],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'refresh-token-value'
            }
          }
        },

        AuthTokensResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIs...'
            },

            refreshToken: {
              type: 'string',
              example: '9f8e7d6c...'
            }
          },
          required: [
            'accessToken',
            'refreshToken'
          ]
        },

        // ==========================================
        // USER
        // ==========================================

        User: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            firstName: {
              type: 'string',
              example: 'Hassan'
            },

            lastName: {
              type: 'string',
              example: 'Elnagar'
            },

            email: {
              type: 'string',
              format: 'email',
              example: 'hassan@example.com'
            },

            role: {
              type: 'string',
              enum: [
                'admin',
                'instructor',
                'student'
              ],
              example: 'student'
            },

            avatar: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/avatar.jpg'
            },

            isActive: {
              type: 'boolean',
              example: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        UserSummary: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            firstName: {
              type: 'string',
              example: 'Hassan'
            },

            lastName: {
              type: 'string',
              example: 'Elnagar'
            },

            avatar: {
              type: 'string',
              nullable: true,
              example: 'https://example.com/avatar.jpg'
            }
          }
        },

        UpdateProfileRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            firstName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Hassan'
            },

            lastName: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              example: 'Elnagar'
            },

            avatar: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example: 'https://example.com/avatar.jpg'
            }
          }
        },

        AdminUpdateUserRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            role: {
              type: 'string',
              enum: [
                'admin',
                'instructor',
                'student'
              ],
              example: 'instructor'
            },

            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },

        // ==========================================
        // CATEGORY
        // ==========================================

        Category: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            name: {
              type: 'string',
              example: 'Web Development'
            },

            slug: {
              type: 'string',
              example: 'web-development'
            },

            description: {
              type: 'string',
              example:
                'Courses related to web development.'
            },

            isActive: {
              type: 'boolean',
              example: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        CreateCategoryRequest: {
          type: 'object',
          required: [
            'name'
          ],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Web Development'
            },

            description: {
              type: 'string',
              maxLength: 500,
              example:
                'Courses related to modern web development.'
            }
          }
        },

        UpdateCategoryRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Web Development'
            },

            description: {
              type: 'string',
              maxLength: 500,
              example:
                'Updated category description.'
            },

            isActive: {
              type: 'boolean',
              example: true
            }
          }
        },

        // ==========================================
        // COURSE
        // ==========================================

        Course: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            title: {
              type: 'string',
              example: 'Complete Node.js Course'
            },

            slug: {
              type: 'string',
              example: 'complete-node-js-course'
            },

            description: {
              type: 'string',
              example:
                'Learn Node.js and Express from beginner to advanced level.'
            },

            instructor: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/UserSummary'
                }
              ]
            },

            category: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/Category'
                }
              ]
            },

            thumbnail: {
              type: 'string',
              nullable: true,
              example:
                'https://example.com/course.jpg'
            },

            level: {
              type: 'string',
              enum: [
                'beginner',
                'intermediate',
                'advanced'
              ],
              example: 'beginner'
            },

            price: {
              type: 'number',
              example: 299
            },

            status: {
              type: 'string',
              enum: [
                'draft',
                'published',
                'archived'
              ],
              example: 'published'
            },

            publishedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        CreateCourseRequest: {
          type: 'object',
          required: [
            'title',
            'description',
            'category'
          ],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Complete Node.js Course'
            },

            description: {
              type: 'string',
              minLength: 20,
              maxLength: 5000,
              example:
                'Learn Node.js and Express from beginner to advanced level.'
            },

            category: {
              $ref: '#/components/schemas/ObjectId'
            },

            thumbnail: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example:
                'https://example.com/course.jpg'
            },

            level: {
              type: 'string',
              enum: [
                'beginner',
                'intermediate',
                'advanced'
              ],
              default: 'beginner',
              example: 'beginner'
            },

            price: {
              type: 'number',
              minimum: 0,
              maximum: 1000000,
              default: 0,
              example: 299
            }
          }
        },

        UpdateCourseRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Advanced Node.js Course'
            },

            description: {
              type: 'string',
              minLength: 20,
              maxLength: 5000,
              example:
                'Updated course description.'
            },

            category: {
              $ref: '#/components/schemas/ObjectId'
            },

            thumbnail: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example:
                'https://example.com/course.jpg'
            },

            level: {
              type: 'string',
              enum: [
                'beginner',
                'intermediate',
                'advanced'
              ],
              example: 'advanced'
            },

            price: {
              type: 'number',
              minimum: 0,
              maximum: 1000000,
              example: 499
            }
          }
        },

        // ==========================================
        // LESSON
        // ==========================================

        Lesson: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            course: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/Course'
                }
              ]
            },

            title: {
              type: 'string',
              example: 'Introduction to Node.js'
            },

            description: {
              type: 'string',
              example:
                'Introduction to Node.js fundamentals.'
            },

            content: {
              type: 'string',
              example:
                'Node.js is a JavaScript runtime.'
            },

            videoUrl: {
              type: 'string',
              nullable: true,
              example:
                'https://example.com/video.mp4'
            },

            duration: {
              type: 'number',
              example: 45
            },

            order: {
              type: 'integer',
              example: 1
            },

            isPublished: {
              type: 'boolean',
              example: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        CreateLessonRequest: {
          type: 'object',
          required: [
            'title',
            'order'
          ],
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Introduction to Node.js'
            },

            description: {
              type: 'string',
              maxLength: 1000,
              example:
                'Introduction to Node.js fundamentals.'
            },

            content: {
              type: 'string',
              example:
                'Node.js is a JavaScript runtime.'
            },

            videoUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example:
                'https://example.com/video.mp4'
            },

            duration: {
              type: 'number',
              minimum: 0,
              maximum: 100000,
              default: 0,
              example: 45
            },

            order: {
              type: 'integer',
              minimum: 1,
              example: 1
            }
          }
        },

        UpdateLessonRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              example: 'Updated Node.js Introduction'
            },

            description: {
              type: 'string',
              maxLength: 1000,
              example:
                'Updated lesson description.'
            },

            content: {
              type: 'string',
              example:
                'Updated lesson content.'
            },

            videoUrl: {
              type: 'string',
              format: 'uri',
              nullable: true,
              example:
                'https://example.com/video-updated.mp4'
            },

            duration: {
              type: 'number',
              minimum: 0,
              maximum: 100000,
              example: 60
            },

            order: {
              type: 'integer',
              minimum: 1,
              example: 2
            }
          }
        },

        // ==========================================
        // ENROLLMENT
        // ==========================================

        Enrollment: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            student: {
              $ref: '#/components/schemas/ObjectId'
            },

            course: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/Course'
                }
              ]
            },

            status: {
              type: 'string',
              enum: [
                'active',
                'completed',
                'cancelled'
              ],
              example: 'active'
            },

            enrolledAt: {
              type: 'string',
              format: 'date-time'
            },

            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ==========================================
        // COMMENT
        // ==========================================

        Comment: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            user: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/UserSummary'
                }
              ]
            },

            lesson: {
              $ref: '#/components/schemas/ObjectId'
            },

            content: {
              type: 'string',
              example:
                'This lesson was very helpful.'
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        CreateCommentRequest: {
          type: 'object',
          required: [
            'content'
          ],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              example:
                'This lesson was very helpful.'
            }
          }
        },

        UpdateCommentRequest: {
          type: 'object',
          required: [
            'content'
          ],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              example:
                'Updated comment content.'
            }
          }
        },

        // ==========================================
        // RATING
        // ==========================================

        Rating: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            user: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/UserSummary'
                }
              ]
            },

            course: {
              $ref: '#/components/schemas/ObjectId'
            },

            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5
            },

            review: {
              type: 'string',
              maxLength: 2000,
              example:
                'Excellent course.'
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        RatingStatistics: {
          type: 'object',
          properties: {
            averageRating: {
              type: 'number',
              example: 4.5
            },

            totalRatings: {
              type: 'integer',
              example: 20
            }
          }
        },

        CreateRatingRequest: {
          type: 'object',
          required: [
            'rating'
          ],
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 5
            },

            review: {
              type: 'string',
              maxLength: 2000,
              example:
                'Excellent course and very clear explanations.'
            }
          }
        },

        UpdateRatingRequest: {
          type: 'object',
          minProperties: 1,
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
              example: 4
            },

            review: {
              type: 'string',
              maxLength: 2000,
              example:
                'Updated review.'
            }
          }
        },

        // ==========================================
        // PROGRESS
        // ==========================================

        LessonProgress: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            enrollment: {
              $ref: '#/components/schemas/ObjectId'
            },

            lesson: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/Lesson'
                }
              ]
            },

            completed: {
              type: 'boolean',
              example: true
            },

            completedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },

            lastViewedAt: {
              type: 'string',
              format: 'date-time',
              nullable: true
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        ProgressSummary: {
          type: 'object',
          properties: {
            totalLessons: {
              type: 'integer',
              example: 10
            },

            completedLessons: {
              type: 'integer',
              example: 7
            },

            progressPercentage: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              example: 70
            }
          }
        },

        UpdateLessonProgressRequest: {
          type: 'object',
          required: [
            'completed'
          ],
          properties: {
            completed: {
              type: 'boolean',
              example: true
            }
          }
        },

        LessonProgressUpdateResponse: {
          type: 'object',
          properties: {
            progress: {
              $ref: '#/components/schemas/LessonProgress'
            },

            summary: {
              $ref: '#/components/schemas/ProgressSummary'
            }
          }
        },

        EnrollmentProgressResponse: {
          type: 'object',
          properties: {
            enrollment: {
              $ref: '#/components/schemas/Enrollment'
            },

            lessons: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Lesson'
              }
            },

            progress: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/LessonProgress'
              }
            },

            summary: {
              $ref: '#/components/schemas/ProgressSummary'
            }
          }
        },

        // ==========================================
        // WISHLIST
        // ==========================================

        Wishlist: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            user: {
              $ref: '#/components/schemas/ObjectId'
            },

            course: {
              oneOf: [
                {
                  $ref: '#/components/schemas/ObjectId'
                },
                {
                  $ref: '#/components/schemas/Course'
                }
              ]
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },

        // ==========================================
        // INSTRUCTOR DASHBOARD
        // ==========================================

        InstructorDashboardOverview: {
          type: 'object',
          properties: {
            totalCourses: {
              type: 'integer',
              example: 10
            },

            publishedCourses: {
              type: 'integer',
              example: 6
            },

            draftCourses: {
              type: 'integer',
              example: 3
            },

            archivedCourses: {
              type: 'integer',
              example: 1
            }
          }
        },

        InstructorCoursePerformance: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            title: {
              type: 'string',
              example: 'Complete Node.js Course'
            },

            slug: {
              type: 'string',
              example: 'complete-node-js-course'
            },

            status: {
              type: 'string',
              enum: [
                'draft',
                'published',
                'archived'
              ],
              example: 'published'
            },

            price: {
              type: 'number',
              example: 299
            },

            createdAt: {
              type: 'string',
              format: 'date-time'
            },

            totalStudents: {
              type: 'integer',
              example: 120
            },

            averageRating: {
              type: 'number',
              example: 4.7
            },

            totalRatings: {
              type: 'integer',
              example: 35
            }
          }
        },

        InstructorDashboard: {
          type: 'object',
          properties: {
            overview: {
              $ref: '#/components/schemas/InstructorDashboardOverview'
            },

            coursePerformance: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/InstructorCoursePerformance'
              }
            }
          }
        },

        // ==========================================
        // ADMIN DASHBOARD
        // ==========================================

        UserStatisticsOverview: {
          type: 'object',
          properties: {
            totalUsers: {
              type: 'integer',
              example: 500
            },

            activeUsers: {
              type: 'integer',
              example: 470
            }
          }
        },

        UsersByRole: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              enum: [
                'admin',
                'instructor',
                'student'
              ],
              example: 'student'
            },

            count: {
              type: 'integer',
              example: 420
            }
          }
        },

        CourseStatisticsOverview: {
          type: 'object',
          properties: {
            totalCourses: {
              type: 'integer',
              example: 80
            },

            publishedCourses: {
              type: 'integer',
              example: 60
            },

            draftCourses: {
              type: 'integer',
              example: 15
            },

            archivedCourses: {
              type: 'integer',
              example: 5
            }
          }
        },

        CoursesByCategory: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              nullable: true,
              example: 'Web Development'
            },

            count: {
              type: 'integer',
              example: 25
            }
          }
        },

        EnrollmentStatisticsOverview: {
          type: 'object',
          properties: {
            totalEnrollments: {
              type: 'integer',
              example: 1000
            },

            activeEnrollments: {
              type: 'integer',
              example: 650
            },

            completedEnrollments: {
              type: 'integer',
              example: 300
            },

            cancelledEnrollments: {
              type: 'integer',
              example: 50
            }
          }
        },

        TopCourse: {
          type: 'object',
          properties: {
            _id: {
              $ref: '#/components/schemas/ObjectId'
            },

            title: {
              type: 'string',
              example: 'Complete Node.js Course'
            },

            slug: {
              type: 'string',
              example: 'complete-node-js-course'
            },

            status: {
              type: 'string',
              enum: [
                'draft',
                'published',
                'archived'
              ],
              example: 'published'
            },

            totalStudents: {
              type: 'integer',
              example: 200
            }
          }
        },

        AdminDashboard: {
          type: 'object',
          properties: {
            users: {
              type: 'object',
              properties: {
                overview: {
                  $ref: '#/components/schemas/UserStatisticsOverview'
                },

                byRole: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/UsersByRole'
                  }
                }
              }
            },

            courses: {
              type: 'object',
              properties: {
                overview: {
                  $ref: '#/components/schemas/CourseStatisticsOverview'
                },

                byCategory: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/CoursesByCategory'
                  }
                }
              }
            },

            enrollments: {
              type: 'object',
              properties: {
                overview: {
                  $ref: '#/components/schemas/EnrollmentStatisticsOverview'
                }
              }
            },

            topCourses: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TopCourse'
              }
            },

            recentEnrollments: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Enrollment'
              }
            }
          }
        },

        // ==========================================
        // HEALTH
        // ==========================================

        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success'
            },

            message: {
              type: 'string',
              example:
                'Online Course Platform API is running'
            }
          },
          required: [
            'status',
            'message'
          ]
        }
      }
    },

    paths: {
      '/health': {
        servers: [
          {
            url: 'http://localhost:5000',
            description: 'Local server'
          }
        ],

        get: {
          tags: [
            'Health'
          ],

          summary: 'Health check',

          description:
            'Check whether the API is running.',

          responses: {
            200: {
              description:
                'API is running successfully',

              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthResponse'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  apis: [
    './src/routes/*.js'
  ]
};

const swaggerSpec =
  swaggerJSDoc(swaggerOptions);

export default swaggerSpec;