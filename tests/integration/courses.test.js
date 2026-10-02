process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.RATE_LIMIT_MAX = '1000';

import request from 'supertest';

import './setup.js';

const { default: app } = await import(
  '../../src/app.js'
);

const { default: Course } = await import(
  '../../src/models/Course.js'
);

beforeAll(async () => {
  await Course.init();
});

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
    accessToken:
      response.body.data.accessToken,
    user: response.body.data.user,
  };
};

const getInstructor = async () => {
  return createUser({
    role: 'instructor',
    firstName: 'Course',
    lastName: 'Instructor',
  });
};

const getStudent = async () => {
  return createUser({
    role: 'student',
    firstName: 'Course',
    lastName: 'Student',
  });
};

const createCategory = async (
  instructorOrAdminToken,
  name = `Category ${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}`
) => {
  const { default: User } = await import(
    '../../src/models/User.js'
  );

  const user = await User.findOne({
    _id: (
      await User.findOne()
    )?._id,
  });

  void user;

  // Categories require admin authorization.
  // Create an admin directly through the test DB.
  const bcrypt = await import('bcryptjs');

  const passwordHash =
    await bcrypt.hash(
      'Password123!',
      12
    );

  const admin = await User.create({
    firstName: 'Test',
    lastName: 'Admin',
    email:
      `admin.category.${Date.now()}.${Math.random()
        .toString(36)
        .slice(2)}@example.com`,
    password: passwordHash,
    role: 'admin',
  });

  // Use the existing auth utility flow to get a token.
  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: admin.email,
      password: 'Password123!',
    })
    .expect(200);

  const categoryResponse = await request(app)
    .post('/api/v1/categories')
    .set(
      'Authorization',
      `Bearer ${loginResponse.body.data.accessToken}`
    )
    .send({
      name,
      description:
        'Course test category',
    })
    .expect(201);

  void instructorOrAdminToken;

  return {
    ...categoryResponse.body.data,
    adminToken:
      loginResponse.body.data.accessToken,
  };
};

const createCoursePayload = (
  categoryId,
  overrides = {}
) => ({
  title:
    overrides.title ||
    `Node.js Course ${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,

  description:
    overrides.description ||
    'A complete Node.js course for backend development and REST API implementation.',

  category: categoryId,

  level:
    overrides.level ||
    'beginner',

  price:
    overrides.price ??
    100,
});

describe('Courses API', () => {
  let category;

  beforeEach(async () => {
    category = await createCategory();
  });

  describe('GET /api/v1/courses', () => {
    it('should return courses publicly', async () => {
      const response = await request(app)
        .get('/api/v1/courses');

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Courses retrieved successfully',
      });

      expect(
        Array.isArray(response.body.data)
      ).toBe(true);

      expect(
        response.body.meta
      ).toBeDefined();
    });

    it('should support pagination and filtering', async () => {
      const instructor =
        await getInstructor();

      await request(app)
        .post('/api/v1/courses')
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send(
          createCoursePayload(
            category._id,
            {
              title: 'Node JS Backend',
              level: 'beginner',
              price: 150,
            }
          )
        )
        .expect(201);

      const response = await request(app)
        .get('/api/v1/courses')
        .query({
          search: 'Node',
          category:
            category._id,
          level: 'beginner',
          page: 1,
          limit: 10,
          sortBy: 'title',
          sortOrder: 'asc',
        });

      expect(response.statusCode).toBe(200);

      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        totalCourses: 0,
        totalPages: 0,
      });

      // Draft courses are hidden because the
      // default status filter is "published".
      expect(response.body.data).toHaveLength(0);
    });

    it('should return published courses', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id,
              {
                title:
                  'Published Node Course',
              }
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      await request(app)
        .post(
          `/api/v1/courses/${courseId}/publish`
        )
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .expect(200);

      const response = await request(app)
        .get('/api/v1/courses')
        .query({
          search: 'Published Node',
        });

      expect(response.statusCode).toBe(200);

      expect(response.body.data).toHaveLength(
        1
      );

      expect(
        response.body.data[0].status
      ).toBe('published');
    });
  });

  describe('POST /api/v1/courses', () => {
    it('should reject unauthenticated users', async () => {
      const response = await request(app)
        .post('/api/v1/courses')
        .send(
          createCoursePayload(
            category._id
          )
        );

      expect(response.statusCode).toBe(401);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Authentication required',
      });
    });

    it('should reject students', async () => {
      const student =
        await getStudent();

      const response = await request(app)
        .post('/api/v1/courses')
        .set(
          'Authorization',
          `Bearer ${student.accessToken}`
        )
        .send(
          createCoursePayload(
            category._id
          )
        );

      expect(response.statusCode).toBe(403);

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'You do not have permission to perform this action',
      });
    });

    it('should allow instructors to create courses', async () => {
      const instructor =
        await getInstructor();

      const response = await request(app)
        .post('/api/v1/courses')
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send(
          createCoursePayload(
            category._id,
            {
              title:
                'Backend Engineering',
              description:
                'Learn backend engineering with Node.js and Express from scratch.',
              price: 250,
              level:
                'intermediate',
            }
          )
        );

      expect(response.statusCode).toBe(
        201
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Course created successfully',
        data: {
          title:
            'Backend Engineering',
          slug:
            'backend-engineering',
          instructor:
            instructor.user._id,
          category:
            category._id,
          level:
            'intermediate',
          price: 250,
          status: 'draft',
        },
      });
    });

    it('should reject an invalid category', async () => {
      const instructor =
        await getInstructor();

      const response = await request(app)
        .post('/api/v1/courses')
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send(
          createCoursePayload(
            '68c123456789abcdef123456'
          )
        );

      expect(response.statusCode).toBe(
        404
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Category not found or inactive',
      });
    });

    it('should reject invalid course data', async () => {
      const instructor =
        await getInstructor();

      const response = await request(app)
        .post('/api/v1/courses')
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send({
          title: 'A',
          description: 'Too short',
          category:
            category._id,
          price: -10,
        });

      expect(response.statusCode).toBe(
        400
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });
  });

  describe('GET /api/v1/courses/:courseId', () => {
    it('should return a course by id', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id,
              {
                title:
                  'Course Details Test',
              }
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response = await request(app)
        .get(
          `/api/v1/courses/${courseId}`
        );

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Course retrieved successfully',
        data: {
          _id: courseId,
          title:
            'Course Details Test',
        },
      });
    });

    it('should reject invalid course id', async () => {
      const response = await request(app)
        .get(
          '/api/v1/courses/not-a-valid-id'
        );

      expect(response.statusCode).toBe(
        400
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });

    it('should return 404 for a missing course', async () => {
      const response = await request(app)
        .get(
          '/api/v1/courses/68c123456789abcdef123456'
        );

      expect(response.statusCode).toBe(
        404
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Course not found',
      });
    });
  });

  describe('GET /api/v1/courses/mine', () => {
    it('should reject students', async () => {
      const student =
        await getStudent();

      const response = await request(app)
        .get('/api/v1/courses/mine')
        .set(
          'Authorization',
          `Bearer ${student.accessToken}`
        );

      expect(response.statusCode).toBe(403);
    });

    it('should return instructor courses', async () => {
      const instructor =
        await getInstructor();

      await request(app)
        .post('/api/v1/courses')
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send(
          createCoursePayload(
            category._id
          )
        )
        .expect(201);

      const response = await request(app)
        .get('/api/v1/courses/mine')
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        );

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Instructor courses retrieved successfully',
      });

      expect(
        Array.isArray(response.body.data)
      ).toBe(true);

      expect(response.body.meta).toBeDefined();
    });
  });

  describe('PATCH /api/v1/courses/:courseId', () => {
    it('should update a course owned by the instructor', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id,
              {
                title:
                  'Original Course',
              }
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response = await request(app)
        .patch(
          `/api/v1/courses/${courseId}`
        )
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send({
          title:
            'Updated Course',
          description:
            'Updated course description with enough characters.',
          price: 500,
        });

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Course updated successfully',
        data: {
          _id: courseId,
          title:
            'Updated Course',
          slug:
            'updated-course',
          price: 500,
        },
      });
    });

    it('should reject another instructor', async () => {
      const owner =
        await getInstructor();

      const anotherInstructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${owner.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response = await request(app)
        .patch(
          `/api/v1/courses/${courseId}`
        )
        .set(
          'Authorization',
          `Bearer ${anotherInstructor.accessToken}`
        )
        .send({
          title:
            'Unauthorized Update',
        });

      expect(response.statusCode).toBe(
        403
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'You are not allowed to modify this course',
      });
    });

    it('should reject empty update data', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response = await request(app)
        .patch(
          `/api/v1/courses/${courseId}`
        )
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .send({});

      expect(response.statusCode).toBe(
        400
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });
  });

  describe('POST /api/v1/courses/:courseId/publish', () => {
    it('should publish an owned course', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response =
        await request(app)
          .post(
            `/api/v1/courses/${courseId}/publish`
          )
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          );

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Course published successfully',
        data: {
          _id: courseId,
          status: 'published',
        },
      });

      expect(
        response.body.data.publishedAt
      ).toBeDefined();
    });

    it('should reject publishing an already published course', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      await request(app)
        .post(
          `/api/v1/courses/${courseId}/publish`
        )
        .set(
          'Authorization',
          `Bearer ${instructor.accessToken}`
        )
        .expect(200);

      const response =
        await request(app)
          .post(
            `/api/v1/courses/${courseId}/publish`
          )
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          );

      expect(response.statusCode).toBe(
        400
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Course is already published',
      });
    });

    it('should reject another instructor', async () => {
      const owner =
        await getInstructor();

      const anotherInstructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${owner.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response =
        await request(app)
          .post(
            `/api/v1/courses/${courseId}/publish`
          )
          .set(
            'Authorization',
            `Bearer ${anotherInstructor.accessToken}`
          );

      expect(response.statusCode).toBe(
        403
      );
    });
  });

  describe('POST /api/v1/courses/:courseId/archive', () => {
    it('should archive an owned course', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response =
        await request(app)
          .post(
            `/api/v1/courses/${courseId}/archive`
          )
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          );

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Course archived successfully',
        data: {
          _id: courseId,
          status: 'archived',
        },
      });
    });
  });

  describe('DELETE /api/v1/courses/:courseId', () => {
    it('should delete an owned course', async () => {
      const instructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${instructor.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const deleteResponse =
        await request(app)
          .delete(
            `/api/v1/courses/${courseId}`
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
            `/api/v1/courses/${courseId}`
          );

      expect(
        getResponse.statusCode
      ).toBe(404);
    });

    it('should reject another instructor from deleting the course', async () => {
      const owner =
        await getInstructor();

      const anotherInstructor =
        await getInstructor();

      const createResponse =
        await request(app)
          .post('/api/v1/courses')
          .set(
            'Authorization',
            `Bearer ${owner.accessToken}`
          )
          .send(
            createCoursePayload(
              category._id
            )
          )
          .expect(201);

      const courseId =
        createResponse.body.data._id;

      const response =
        await request(app)
          .delete(
            `/api/v1/courses/${courseId}`
          )
          .set(
            'Authorization',
            `Bearer ${anotherInstructor.accessToken}`
          );

      expect(response.statusCode).toBe(
        403
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'You are not allowed to delete this course',
      });
    });
  });
});