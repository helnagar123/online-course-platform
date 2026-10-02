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

  return Category.create({
    name: `Enrollment Category ${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    slug: `enrollment-category-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    description:
      'Category for enrollment tests',
  });
};

const createCourse = async (
  instructorToken,
  categoryId,
  {
    publish = true,
  } = {}
) => {
  const response = await request(app)
    .post('/api/v1/courses')
    .set(
      'Authorization',
      `Bearer ${instructorToken}`
    )
    .send({
      title:
        `Enrollment Course ${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 7)}`,
      description:
        'A course created specifically for enrollment integration testing.',
      category: categoryId,
      level: 'beginner',
      price: 100,
    })
    .expect(201);

  const course =
    response.body.data;

  if (publish) {
    await request(app)
      .post(
        `/api/v1/courses/${course._id}/publish`
      )
      .set(
        'Authorization',
        `Bearer ${instructorToken}`
      )
      .expect(200);
  }

  return course;
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
    );
};

describe('Enrollments API', () => {
  describe(
    'POST /api/v1/courses/:courseId/enrollments',
    () => {
      it('should reject unauthenticated requests', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

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
              `/api/v1/courses/${course._id}/enrollments`
            );

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

        const category =
          await createCategory();

        const course =
          await createCourse(
            instructor.accessToken,
            category._id
          );

        const response =
          await enrollStudent(
            instructor.accessToken,
            course._id
          );

        expect(
          response.statusCode
        ).toBe(403);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'You do not have permission to perform this action',
        });
      });

      it('should enroll a student in a published course', async () => {
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

        const response =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        expect(
          response.statusCode
        ).toBe(201);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Enrollment created successfully',
          data: {
            student:
              student.user._id,
            course:
              course._id,
            status: 'active',
          },
        });
      });

      it('should reject enrollment in an unpublished course', async () => {
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
            category._id,
            {
              publish: false,
            }
          );

        const response =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        expect(
          response.statusCode
        ).toBe(404);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'Course not found or not available for enrollment',
        });
      });

      it('should reject duplicate enrollment', async () => {
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

        const firstResponse =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        expect(
          firstResponse.statusCode
        ).toBe(201);

        const secondResponse =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        expect(
          secondResponse.statusCode
        ).toBe(409);

        expect(
          secondResponse.body
        ).toMatchObject({
          status: 'error',
          message:
            'You are already enrolled in this course',
        });
      });

      it('should reject an invalid course id', async () => {
        const student =
          await createUser({
            role: 'student',
          });

        const response =
          await request(app)
            .post(
              '/api/v1/courses/not-a-valid-id/enrollments'
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

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
    'GET /api/v1/enrollments/me',
    () => {
      it('should reject unauthenticated requests', async () => {
        const response =
          await request(app)
            .get(
              '/api/v1/enrollments/me'
            );

        expect(
          response.statusCode
        ).toBe(401);
      });

      it('should reject instructors', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const response =
          await request(app)
            .get(
              '/api/v1/enrollments/me'
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(403);
      });

      it('should return the current student enrollments', async () => {
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

        const enrollResponse =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        expect(
          enrollResponse.statusCode
        ).toBe(201);

        const response =
          await request(app)
            .get(
              '/api/v1/enrollments/me'
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Enrollments retrieved successfully',
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
          response.body.data[0].student
        ).toBe(student.user._id);
      });
    }
  );

  describe(
    'GET /api/v1/enrollments/:enrollmentId',
    () => {
      it('should return the student enrollment', async () => {
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

        const enrollResponse =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        const enrollmentId =
          enrollResponse.body.data._id;

        const response =
          await request(app)
            .get(
              `/api/v1/enrollments/${enrollmentId}`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Enrollment retrieved successfully',
          data: {
            _id: enrollmentId,
            student:
              student.user._id,
            course: {
              _id: course._id,
              title: course.title,
            },
          },
        });
      });

      it('should prevent one student from reading another student enrollment', async () => {
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

        const enrollResponse =
          await enrollStudent(
            studentOne.accessToken,
            course._id
          );

        const enrollmentId =
          enrollResponse.body.data._id;

        const response =
          await request(app)
            .get(
              `/api/v1/enrollments/${enrollmentId}`
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
          message: 'Enrollment not found',
        });
      });

      it('should reject an invalid enrollment id', async () => {
        const student =
          await createUser({
            role: 'student',
          });

        const response =
          await request(app)
            .get(
              '/api/v1/enrollments/not-a-valid-id'
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

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
    'PATCH /api/v1/enrollments/:enrollmentId/cancel',
    () => {
      it('should cancel an active enrollment', async () => {
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

        const enrollResponse =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        const enrollmentId =
          enrollResponse.body.data._id;

        const response =
          await request(app)
            .patch(
              `/api/v1/enrollments/${enrollmentId}/cancel`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Enrollment cancelled successfully',
          data: {
            _id: enrollmentId,
            status: 'cancelled',
          },
        });
      });

      it('should reject cancelling another student enrollment', async () => {
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

        const enrollResponse =
          await enrollStudent(
            studentOne.accessToken,
            course._id
          );

        const enrollmentId =
          enrollResponse.body.data._id;

        const response =
          await request(app)
            .patch(
              `/api/v1/enrollments/${enrollmentId}/cancel`
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
          message: 'Enrollment not found',
        });
      });

      it('should reject cancelling a completed enrollment', async () => {
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

        const enrollResponse =
          await enrollStudent(
            student.accessToken,
            course._id
          );

        const enrollmentId =
          enrollResponse.body.data._id;

        const { default: Enrollment } =
          await import(
            '../../src/models/Enrollment.js'
          );

        await Enrollment.findByIdAndUpdate(
          enrollmentId,
          {
            status: 'completed',
            completedAt: new Date(),
          }
        );

        const response =
          await request(app)
            .patch(
              `/api/v1/enrollments/${enrollmentId}/cancel`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(400);

        expect(response.body).toMatchObject({
          status: 'error',
          message:
            'Completed enrollment cannot be cancelled',
        });
      });

      it('should reject instructors', async () => {
        const instructor =
          await createUser({
            role: 'instructor',
          });

        const response =
          await request(app)
            .patch(
              '/api/v1/enrollments/68c123456789abcdef123456/cancel'
            )
            .set(
              'Authorization',
              `Bearer ${instructor.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(403);
      });
    }
  );
});