process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.RATE_LIMIT_MAX = '1000';

import request from 'supertest';

import './setup.js';

const { default: app } = await import(
  '../../src/app.js'
);

const createUser = async ({
  role = 'student',
  firstName = 'Test',
  lastName = 'User',
} = {}) => {
  const email =
    `${role}.${Date.now()}.${Math.random()
      .toString(36)
      .slice(2)}@example.com`;

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      firstName,
      lastName,
      email,
      password: 'Password123!',
      role,
    })
    .expect(201);

  return {
    email,
    password: 'Password123!',
    accessToken:
      response.body.data.accessToken,
    user: response.body.data.user,
  };
};

const createInstructor = async () => {
  return createUser({
    role: 'instructor',
    firstName: 'Lesson',
    lastName: 'Instructor',
  });
};

const createStudent = async () => {
  return createUser({
    role: 'student',
    firstName: 'Lesson',
    lastName: 'Student',
  });
};

const createCategory = async () => {
  const { default: Category } = await import(
    '../../src/models/Category.js'
  );

  return Category.create({
    name: `Lesson Category ${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    slug: `lesson-category-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    description: 'Category for lesson tests',
  });
};

const createCourse = async (
  instructorToken,
  categoryId
) => {
  const response = await request(app)
    .post('/api/v1/courses')
    .set(
      'Authorization',
      `Bearer ${instructorToken}`
    )
    .send({
      title: `Lesson Test Course ${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 7)}`,

      description:
        'A course created for testing lesson management and publishing.',

      category: categoryId,
      level: 'beginner',
      price: 100,
    })
    .expect(201);

  return response.body.data;
};

const createLesson = async ({
  instructorToken,
  courseId,
  overrides = {},
}) => {
  const response = await request(app)
    .post(
      `/api/v1/courses/${courseId}/lessons`
    )
    .set(
      'Authorization',
      `Bearer ${instructorToken}`
    )
    .send({
      title:
        overrides.title ||
        `Lesson ${Date.now()}`,

      description:
        overrides.description ||
        'Lesson description',

      content:
        overrides.content ||
        'Lesson content for integration testing.',

      videoUrl:
        overrides.videoUrl ||
        'https://example.com/video.mp4',

      duration:
        overrides.duration ??
        15,

      order:
        overrides.order ??
        1,
    })
    .expect(201);

  return response.body.data;
};

describe('Lessons API', () => {
  describe(
    'POST /api/v1/courses/:courseId/lessons',
    () => {
      it('should reject unauthenticated requests', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const response =
          await request(app)
            .post(
              `/api/v1/courses/${course._id}/lessons`
            )
            .send({
              title: 'Introduction',
              order: 1,
            });

        expect(
          response.statusCode
        ).toBe(401);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'Authentication required',
        });
      });

      it('should reject students', async () => {
        const instructor =
          await createInstructor();

        const student =
          await createStudent();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const response =
          await request(app)
            .post(
              `/api/v1/courses/${course._id}/lessons`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            )
            .send({
              title: 'Introduction',
              order: 1,
            });

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You do not have permission to perform this action',
        });
      });

      it('should create a lesson for the course instructor', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const response =
          await request(app)
            .post(
              `/api/v1/courses/${course._id}/lessons`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({
              title: 'Introduction to Node.js',
              description:
                'Introduction lesson',
              content:
                'Node.js fundamentals',
              videoUrl:
                'https://example.com/node.mp4',
              duration: 25,
              order: 1,
            });

        expect(
          response.statusCode
        ).toBe(201);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Lesson created successfully',
          data: {
            title:
              'Introduction to Node.js',
            description:
              'Introduction lesson',
            content:
              'Node.js fundamentals',
            duration: 25,
            order: 1,
            course:
              course._id,
            isPublished: false,
          },
        });
      });

      it('should reject duplicate lesson order in the same course', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        await createLesson({
          instructorToken:
            instructor.accessToken,
          courseId: course._id,
          overrides: {
            order: 1,
          },
        });

        const response =
          await request(app)
            .post(
              `/api/v1/courses/${course._id}/lessons`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({
              title: 'Duplicate Order',
              order: 1,
            });

        expect(
          response.statusCode
        ).toBe(409);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'A lesson with this order already exists',
        });
      });

      it('should reject invalid lesson data', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const response =
          await request(app)
            .post(
              `/api/v1/courses/${course._id}/lessons`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({
              title: 'A',
              order: 0,
              duration: -10,
            });

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Validation failed',
        });
      });

      it('should reject an instructor who does not own the course', async () => {
        const owner =
          await createInstructor();

        const otherInstructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            owner.accessToken,
            category._id
          );

        const response =
          await request(app)
            .post(
              `/api/v1/courses/${course._id}/lessons`
            )
            .set(
              'Authorization',
              `Bearer ${otherInstructor.accessToken}`
            )
            .send({
              title: 'Unauthorized Lesson',
              order: 1,
            });

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You are not allowed to manage lessons for this course',
        });
      });
    }
  );

  describe(
    'GET /api/v1/courses/:courseId/lessons',
    () => {
      it('should return only published lessons', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const firstLesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
            overrides: {
              title: 'First Lesson',
              order: 1,
            },
          });

        const secondLesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
            overrides: {
              title: 'Second Lesson',
              order: 2,
            },
          });

        await request(app)
          .post(
            `/api/v1/lessons/${firstLesson._id}/publish`
          )
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .expect(200);

        const response =
          await request(app)
            .get(
              `/api/v1/courses/${course._id}/lessons`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Lessons retrieved successfully',
        });

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0]._id
        ).toBe(firstLesson._id);

        expect(
          response.body.data[0].isPublished
        ).toBe(true);

        expect(
          response.body.data.some(
            (lesson) =>
              lesson._id ===
              secondLesson._id
          )
        ).toBe(false);
      });

      it('should reject an invalid course id', async () => {
        const response =
          await request(app).get(
            '/api/v1/courses/not-a-valid-id/lessons'
          );

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Validation failed',
        });
      });

      it('should return 404 for a missing course', async () => {
        const response =
          await request(app).get(
            '/api/v1/courses/68c123456789abcdef123456/lessons'
          );

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Course not found',
        });
      });
    }
  );

  describe(
    'GET /api/v1/lessons/:lessonId',
    () => {
      it('should return a lesson by id', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .get(
              `/api/v1/lessons/${lesson._id}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Lesson retrieved successfully',
          data: {
            _id: lesson._id,
            title: lesson.title,
          },
        });
      });

      it('should reject an invalid lesson id', async () => {
        const response =
          await request(app).get(
            '/api/v1/lessons/not-a-valid-id'
          );

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Validation failed',
        });
      });

      it('should return 404 for a missing lesson', async () => {
        const response =
          await request(app).get(
            '/api/v1/lessons/68c123456789abcdef123456'
          );

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Lesson not found',
        });
      });
    }
  );

  describe(
    'PATCH /api/v1/lessons/:lessonId',
    () => {
      it('should update a lesson owned by the instructor', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .patch(
              `/api/v1/lessons/${lesson._id}`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({
              title:
                'Updated Lesson',
              description:
                'Updated description',
              duration: 30,
              order: 2,
            });

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Lesson updated successfully',
          data: {
            _id: lesson._id,
            title:
              'Updated Lesson',
            description:
              'Updated description',
            duration: 30,
            order: 2,
          },
        });
      });

      it('should reject another instructor', async () => {
        const owner =
          await createInstructor();

        const otherInstructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            owner.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              owner.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .patch(
              `/api/v1/lessons/${lesson._id}`
            )
            .set(
              'Authorization',
              `Bearer ${otherInstructor.accessToken}`
            )
            .send({
              title:
                'Unauthorized Update',
            });

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You are not allowed to modify this lesson',
        });
      });

      it('should reject duplicate lesson order on update', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const firstLesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
            overrides: {
              order: 1,
            },
          });

        const secondLesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
            overrides: {
              order: 2,
            },
          });

        const response =
          await request(app)
            .patch(
              `/api/v1/lessons/${secondLesson._id}`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({
              order: 1,
            });

        expect(
          response.statusCode
        ).toBe(409);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'A lesson with this order already exists',
        });

        void firstLesson;
      });

      it('should reject an empty update', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .patch(
              `/api/v1/lessons/${lesson._id}`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({});

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Validation failed',
        });
      });
    }
  );

  describe(
    'POST /api/v1/lessons/:lessonId/publish',
    () => {
      it('should publish an owned lesson', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .post(
              `/api/v1/lessons/${lesson._id}/publish`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Lesson published successfully',
          data: {
            _id: lesson._id,
            isPublished: true,
          },
        });
      });

      it('should reject another instructor', async () => {
        const owner =
          await createInstructor();

        const otherInstructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            owner.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              owner.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .post(
              `/api/v1/lessons/${lesson._id}/publish`
            )
            .set(
              'Authorization',
              `Bearer ${otherInstructor.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You are not allowed to publish this lesson',
        });
      });
    }
  );

  describe(
    'DELETE /api/v1/lessons/:lessonId',
    () => {
      it('should delete an owned lesson', async () => {
        const instructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              instructor.accessToken,
            courseId: course._id,
          });

        const deleteResponse =
          await request(app)
            .delete(
              `/api/v1/lessons/${lesson._id}`
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            );

        expect(
          deleteResponse.statusCode
        ).toBe(204);

        const getResponse =
          await request(app)
            .get(
              `/api/v1/lessons/${lesson._id}`
            );

        expect(
          getResponse.statusCode
        ).toBe(404);
      });

      it('should reject another instructor', async () => {
        const owner =
          await createInstructor();

        const otherInstructor =
          await createInstructor();

        const category =
          await createCategory();

        const course =
          await createCourse(
            owner.accessToken,
            category._id
          );

        const lesson =
          await createLesson({
            instructorToken:
              owner.accessToken,
            courseId: course._id,
          });

        const response =
          await request(app)
            .delete(
              `/api/v1/lessons/${lesson._id}`
            )
            .set(
              'Authorization',
              `Bearer ${otherInstructor.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You are not allowed to delete this lesson',
        });
      });
    }
  );
});