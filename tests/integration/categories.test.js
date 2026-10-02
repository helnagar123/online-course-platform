process.env.AUTH_RATE_LIMIT_MAX = '1000';

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

const getAdminUser = async () => {
  const admin = await createUser();

  const { default: User } = await import(
    '../../src/models/User.js'
  );

  const updatedUser =
    await User.findByIdAndUpdate(
      admin.user._id,
      {
        role: 'admin',
      },
      {
        new: true,
      }
    );

  return {
    ...admin,
    user: updatedUser,
  };
};

const createCategory = async (
  adminToken,
  overrides = {}
) => {
  const name =
    overrides.name ||
    `Web Development ${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

  const response = await request(app)
    .post('/api/v1/categories')
    .set(
      'Authorization',
      `Bearer ${adminToken}`
    )
    .send({
      name,
      description:
        overrides.description ||
        'Category description',
    });

  return {
    response,
    name,
  };
};

describe('Categories API', () => {
  describe('GET /api/v1/categories', () => {
    it('should return active categories publicly', async () => {
      const response = await request(app)
        .get('/api/v1/categories');

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Categories retrieved successfully',
      });

      expect(
        Array.isArray(response.body.data)
      ).toBe(true);
    });

    it('should not require authentication', async () => {
      const response = await request(app)
        .get('/api/v1/categories');

      expect(response.statusCode).not.toBe(
        401
      );
    });
  });

  describe('POST /api/v1/categories', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/v1/categories')
        .send({
          name: 'Backend',
          description:
            'Backend development',
        });

      expect(response.statusCode).toBe(401);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Authentication required',
      });
    });

    it('should reject non-admin users', async () => {
      const user = await createUser();

      const response = await request(app)
        .post('/api/v1/categories')
        .set(
          'Authorization',
          `Bearer ${user.accessToken}`
        )
        .send({
          name: 'Backend',
          description:
            'Backend development',
        });

      expect(response.statusCode).toBe(403);

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'You do not have permission to perform this action',
      });
    });

    it('should create a category for an admin', async () => {
      const admin =
        await getAdminUser();

      const { response } =
        await createCategory(
          admin.accessToken,
          {
            name: 'Backend Development',
            description:
              'Backend development category',
          }
        );

      expect(response.statusCode).toBe(
        201
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Category created successfully',
        data: {
          name: 'Backend Development',
          slug: 'backend-development',
          description:
            'Backend development category',
          isActive: true,
        },
      });
    });

    it('should reject duplicate category names', async () => {
      const admin =
        await getAdminUser();

      await createCategory(
        admin.accessToken,
        {
          name: 'Data Science',
        }
      );

      const response = await request(app)
        .post('/api/v1/categories')
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        )
        .send({
          name: 'data science',
          description:
            'Duplicate category',
        });

      expect(response.statusCode).toBe(
        409
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Category already exists',
      });
    });

    it('should reject invalid category data', async () => {
      const admin =
        await getAdminUser();

      const response = await request(app)
        .post('/api/v1/categories')
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        )
        .send({
          name: 'A',
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

  describe('GET /api/v1/categories/:categoryId', () => {
    it('should return a category by id', async () => {
      const admin =
        await getAdminUser();

      const { response: createResponse } =
        await createCategory(
          admin.accessToken,
          {
            name: 'Machine Learning',
          }
        );

      const categoryId =
        createResponse.body.data._id;

      const response = await request(app)
        .get(
          `/api/v1/categories/${categoryId}`
        );

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Category retrieved successfully',
        data: {
          _id: categoryId,
          name: 'Machine Learning',
          slug: 'machine-learning',
        },
      });
    });

    it('should reject an invalid category id', async () => {
      const response = await request(app)
        .get(
          '/api/v1/categories/not-a-valid-id'
        );

      expect(response.statusCode).toBe(
        400
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });

    it('should return 404 for a missing category', async () => {
      const response = await request(app)
        .get(
          '/api/v1/categories/68c123456789abcdef123456'
        );

      expect(response.statusCode).toBe(
        404
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Category not found',
      });
    });
  });

  describe('PATCH /api/v1/categories/:categoryId', () => {
    it('should update a category for an admin', async () => {
      const admin =
        await getAdminUser();

      const { response: createResponse } =
        await createCategory(
          admin.accessToken,
          {
            name: 'Web Development',
          }
        );

      const categoryId =
        createResponse.body.data._id;

      const response = await request(app)
        .patch(
          `/api/v1/categories/${categoryId}`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        )
        .send({
          name: 'Advanced Web Development',
          description:
            'Advanced web development category',
        });

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Category updated successfully',
        data: {
          _id: categoryId,
          name:
            'Advanced Web Development',
          slug:
            'advanced-web-development',
          description:
            'Advanced web development category',
        },
      });
    });

    it('should reject non-admin users', async () => {
      const admin =
        await getAdminUser();

      const { response: createResponse } =
        await createCategory(
          admin.accessToken,
          {
            name: 'Programming',
          }
        );

      const categoryId =
        createResponse.body.data._id;

      const student = await createUser();

      const response = await request(app)
        .patch(
          `/api/v1/categories/${categoryId}`
        )
        .set(
          'Authorization',
          `Bearer ${student.accessToken}`
        )
        .send({
          name: 'Unauthorized Update',
        });

      expect(response.statusCode).toBe(
        403
      );
    });

    it('should reject empty update data', async () => {
      const admin =
        await getAdminUser();

      const { response: createResponse } =
        await createCategory(
          admin.accessToken
        );

      const categoryId =
        createResponse.body.data._id;

      const response = await request(app)
        .patch(
          `/api/v1/categories/${categoryId}`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
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

    it('should reject duplicate category names during update', async () => {
      const admin =
        await getAdminUser();

      const first =
        await createCategory(
          admin.accessToken,
          {
            name: 'Frontend Development',
          }
        );

      const second =
        await createCategory(
          admin.accessToken,
          {
            name: 'Backend Development',
          }
        );

      const secondId =
        second.response.body.data._id;

      expect(
        first.response.statusCode
      ).toBe(201);

      const response = await request(app)
        .patch(
          `/api/v1/categories/${secondId}`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        )
        .send({
          name: 'Frontend Development',
        });

      expect(response.statusCode).toBe(
        409
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Category name already exists',
      });
    });
  });

  describe(
    'PATCH /api/v1/categories/:categoryId/deactivate',
    () => {
      it('should deactivate a category for an admin', async () => {
        const admin =
          await getAdminUser();

        const {
          response: createResponse,
        } = await createCategory(
          admin.accessToken,
          {
            name: 'DevOps',
          }
        );

        const categoryId =
          createResponse.body.data._id;

        const response =
          await request(app)
            .patch(
              `/api/v1/categories/${categoryId}/deactivate`
            )
            .set(
              'Authorization',
              `Bearer ${admin.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(200);

        expect(response.body).toMatchObject({
          status: 'success',
          message:
            'Category deactivated successfully',
          data: {
            _id: categoryId,
            isActive: false,
          },
        });
      });

      it('should reject non-admin users', async () => {
        const admin =
          await getAdminUser();

        const {
          response: createResponse,
        } = await createCategory(
          admin.accessToken,
          {
            name: 'Cloud Computing',
          }
        );

        const categoryId =
          createResponse.body.data._id;

        const student =
          await createUser();

        const response =
          await request(app)
            .patch(
              `/api/v1/categories/${categoryId}/deactivate`
            )
            .set(
              'Authorization',
              `Bearer ${student.accessToken}`
            );

        expect(
          response.statusCode
        ).toBe(403);
      });

      it('should remove a deactivated category from the public list', async () => {
        const admin =
          await getAdminUser();

        const {
          response: createResponse,
        } = await createCategory(
          admin.accessToken,
          {
            name: 'Cyber Security',
          }
        );

        const categoryId =
          createResponse.body.data._id;

        await request(app)
          .patch(
            `/api/v1/categories/${categoryId}/deactivate`
          )
          .set(
            'Authorization',
            `Bearer ${admin.accessToken}`
          )
          .expect(200);

        const response = await request(app)
          .get('/api/v1/categories');

        expect(response.statusCode).toBe(
          200
        );

        expect(
          response.body.data.some(
            (category) =>
              category._id === categoryId
          )
        ).toBe(false);
      });
    }
  );
});