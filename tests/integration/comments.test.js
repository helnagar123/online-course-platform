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

const createCategory = async () => {
  const { default: Category } = await import(
    '../../src/models/Category.js'
  );

  const unique =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

  return Category.create({
    name: `Comments Category ${unique}`,
    slug: `comments-category-${unique}`,
    description:
      'Category used for comment integration tests',
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
      title:
        `Comments Course ${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      description:
        'A course created for comment integration testing purposes.',

      category: categoryId,
      level: 'beginner',
      price: 100,
    })
    .expect(201);

  const course =
    response.body.data;

  await request(app)
    .post(
      `/api/v1/courses/${course._id}/publish`
    )
    .set(
      'Authorization',
      `Bearer ${instructorToken}`
    )
    .expect(200);

  return course;
};

const createLesson = async (
  instructorToken,
  courseId,
  {
    publish = true,
    order = 1,
  } = {}
) => {
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
        `Comment Lesson ${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,

      description:
        'Lesson description for comment testing',

      content:
        'Lesson content for comment testing',

      videoUrl:
        'https://example.com/comment-video.mp4',

      duration: 20,
      order,
    })
    .expect(201);

  const lesson =
    response.body.data;

  if (publish) {
    await request(app)
      .post(
        `/api/v1/lessons/${lesson._id}/publish`
      )
      .set(
        'Authorization',
        `Bearer ${instructorToken}`
      )
      .expect(200);
  }

  return lesson;
};

const enrollStudent = async (
  studentToken,
  courseId
) => {
  return request(app)
    .post(
      `/api/v1/courses/${courseId}/enrollments`
    )
    .set(
      'Authorization',
      `Bearer ${studentToken}`
    )
    .expect(201);
};

const createComment = async (
  studentToken,
  lessonId,
  content = 'Great lesson!'
) => {
  return request(app)
    .post(
      `/api/v1/lessons/${lessonId}/comments`
    )
    .set(
      'Authorization',
      `Bearer ${studentToken}`
    )
    .send({
      content,
    });
};

describe('Comments API', () => {
  describe(
    'POST /api/v1/lessons/:lessonId/comments',
    () => {
      it('should reject unauthenticated requests', async () => {
        const response =
          await request(app)
            .post(
              '/api/v1/lessons/68c123456789abcdef123456/comments'
            )
            .send({
              content: 'Nice lesson',
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

      it('should reject instructors', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const response =
          await request(app)
            .post(
              '/api/v1/lessons/68c123456789abcdef123456/comments'
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            )
            .send({
              content: 'Instructor comment',
            });

        expect(
          response.statusCode
        ).toBe(403);
      });

      it('should reject a student who is not enrolled', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        const response =
          await createComment(
            student.accessToken,
            lesson._id,
            'I am not enrolled'
          );

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You must be enrolled in this course to comment',
        });
      });

      it('should reject comments on unpublished lessons', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id,
            {
              publish: false,
            }
          );

        await enrollStudent(
          student.accessToken,
          course._id
        );

        const response =
          await createComment(
            student.accessToken,
            lesson._id,
            'Comment on draft lesson'
          );

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'Lesson not found or unavailable',
        });
      });

      it('should create a comment for an enrolled student', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          student.accessToken,
          course._id
        );

        const response =
          await createComment(
            student.accessToken,
            lesson._id,
            'Excellent explanation!'
          );

        expect(
          response.statusCode
        ).toBe(201);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Comment created successfully',
          data: {
            user: {
              _id:
                student.user._id,
            },
            lesson:
              lesson._id,
            content:
              'Excellent explanation!',
          },
        });
      });

      it('should reject invalid comment data', async () => {
        const student =
          await createUser({
            role: 'student',
          });

        const response =
          await request(app)
            .post(
              '/api/v1/lessons/68c123456789abcdef123456/comments'
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            )
            .send({
              content: '',
            });

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Validation failed',
        });
      });

      it('should reject an invalid lesson id', async () => {
        const student =
          await createUser({
            role: 'student',
          });

        const response =
          await request(app)
            .post(
              '/api/v1/lessons/not-a-valid-id/comments'
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            )
            .send({
              content:
                'Valid comment content',
            });

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
    'GET /api/v1/lessons/:lessonId/comments',
    () => {
      it('should return lesson comments publicly', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          student.accessToken,
          course._id
        );

        await createComment(
          student.accessToken,
          lesson._id,
          'Public comment'
        );

        const response =
          await request(app)
            .get(
              `/api/v1/lessons/${lesson._id}/comments`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Comments retrieved successfully',
        });

        expect(
          Array.isArray(
            response.body.data
          )
        ).toBe(true);

        expect(
          response.body.data
        ).toHaveLength(1);

        expect(
          response.body.data[0].content
        ).toBe('Public comment');
      });

      it('should return 404 for a missing lesson', async () => {
        const response =
          await request(app)
            .get(
              '/api/v1/lessons/68c123456789abcdef123456/comments'
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
    'GET /api/v1/comments/:commentId',
    () => {
      it('should return a comment by id', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          student.accessToken,
          course._id
        );

        const commentResponse =
          await createComment(
            student.accessToken,
            lesson._id,
            'Find this comment'
          );

        const commentId =
          commentResponse.body.data._id;

        const response =
          await request(app)
            .get(
              `/api/v1/comments/${commentId}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Comment retrieved successfully',
          data: {
            _id: commentId,
            content:
              'Find this comment',
          },
        });
      });

      it('should reject an invalid comment id', async () => {
        const response =
          await request(app)
            .get(
              '/api/v1/comments/not-a-valid-id'
            );

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Validation failed',
        });
      });

      it('should return 404 for a missing comment', async () => {
        const response =
          await request(app)
            .get(
              '/api/v1/comments/68c123456789abcdef123456'
            );

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message: 'Comment not found',
        });
      });
    }
  );

  describe(
    'PATCH /api/v1/comments/:commentId',
    () => {
      it('should allow a student to update their own comment', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          student.accessToken,
          course._id
        );

        const commentResponse =
          await createComment(
            student.accessToken,
            lesson._id,
            'Original comment'
          );

        const commentId =
          commentResponse.body.data._id;

        const response =
          await request(app)
            .patch(
              `/api/v1/comments/${commentId}`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            )
            .send({
              content:
                'Updated comment',
            });

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Comment updated successfully',
          data: {
            _id: commentId,
            content:
              'Updated comment',
          },
        });
      });

      it('should reject another student from updating the comment', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const studentOne =
          await createUser({
            role: 'student',
          });

        const studentTwo =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          studentOne.accessToken,
          course._id
        );

        const commentResponse =
          await createComment(
            studentOne.accessToken,
            lesson._id,
            'Student one comment'
          );

        const commentId =
          commentResponse.body.data._id;

        const response =
          await request(app)
            .patch(
              `/api/v1/comments/${commentId}`
            )
            .set(
              'Authorization',
              `Bearer ${studentTwo.accessToken}`
            )
            .send({
              content:
                'Unauthorized update',
            });

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'Comment not found or you are not allowed to modify it',
        });
      });

      it('should reject invalid update data', async () => {
        const student =
          await createUser({
            role: 'student',
          });

        const response =
          await request(app)
            .patch(
              '/api/v1/comments/68c123456789abcdef123456'
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            )
            .send({
              content: '',
            });

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
    'DELETE /api/v1/comments/:commentId',
    () => {
      it('should allow a student to delete their own comment', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const student =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          student.accessToken,
          course._id
        );

        const commentResponse =
          await createComment(
            student.accessToken,
            lesson._id,
            'Delete this comment'
          );

        const commentId =
          commentResponse.body.data._id;

        const deleteResponse =
          await request(app)
            .delete(
              `/api/v1/comments/${commentId}`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

        expect(
          deleteResponse.statusCode
        ).toBe(204);

        const getResponse =
          await request(app)
            .get(
              `/api/v1/comments/${commentId}`
            );

        expect(
          getResponse.statusCode
        ).toBe(404);
      });

      it('should reject another student from deleting the comment', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const studentOne =
          await createUser({
            role: 'student',
          });

        const studentTwo =
          await createUser({
            role: 'student',
          });

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const lesson =
          await createLesson(
            instructor.accessToken,
            course._id
          );

        await enrollStudent(
          studentOne.accessToken,
          course._id
        );

        const commentResponse =
          await createComment(
            studentOne.accessToken,
            lesson._id,
            'Protected comment'
          );

        const commentId =
          commentResponse.body.data._id;

        const response =
          await request(app)
            .delete(
              `/api/v1/comments/${commentId}`
            )
            .set(
              'Authorization',
              `Bearer ${studentTwo.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'Comment not found or you are not allowed to delete it',
        });
      });
    }
  );
});