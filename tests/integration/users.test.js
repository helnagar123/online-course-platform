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
  const uniqueEmail =
    `${role}.${Date.now()}.${Math.random()
      .toString(36)
      .slice(2)}@example.com`;

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      firstName,
      lastName,
      email: uniqueEmail,
      password: 'Password123!',
      role,
    })
    .expect(201);

  return {
    email: uniqueEmail,
    password: 'Password123!',
    accessToken:
      response.body.data.accessToken,
    refreshToken:
      response.body.data.refreshToken,
    user: response.body.data.user,
  };
};

const getAdminUser = async () => {
  const admin = await createUser({
    role: 'student',
    firstName: 'Admin',
    lastName: 'User',
  });

  const { default: User } = await import(
    '../../src/models/User.js'
  );

  const updatedAdmin =
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
    user: updatedAdmin,
  };
};

describe('Users API', () => {
  describe('GET /api/v1/users/me', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/users/me');

      expect(response.statusCode).toBe(401);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Authentication required',
      });
    });

    it('should return the authenticated user profile', async () => {
      const user = await createUser({
        firstName: 'Hassan',
        lastName: 'Elnagar',
      });

      const response = await request(app)
        .get('/api/v1/users/me')
        .set(
          'Authorization',
          `Bearer ${user.accessToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'Profile retrieved successfully',
        data: {
          firstName: 'Hassan',
          lastName: 'Elnagar',
          email: user.email,
          role: 'student',
        },
      });
    });
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update the authenticated user profile', async () => {
      const user = await createUser({
        firstName: 'Hassan',
        lastName: 'Elnagar',
      });

      const response = await request(app)
        .patch('/api/v1/users/me')
        .set(
          'Authorization',
          `Bearer ${user.accessToken}`
        )
        .send({
          firstName: 'Ahmed',
          lastName: 'Ali',
        });

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'Profile updated successfully',
        data: {
          firstName: 'Ahmed',
          lastName: 'Ali',
          email: user.email,
        },
      });
    });

    it('should reject invalid profile data', async () => {
      const user = await createUser();

      const response = await request(app)
        .patch('/api/v1/users/me')
        .set(
          'Authorization',
          `Bearer ${user.accessToken}`
        )
        .send({
          firstName: 'A',
        });

      expect(response.statusCode).toBe(400);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });

    it('should not allow role changes through profile update', async () => {
      const user = await createUser();

      const response = await request(app)
        .patch('/api/v1/users/me')
        .set(
          'Authorization',
          `Bearer ${user.accessToken}`
        )
        .send({
          role: 'admin',
        });

      expect(response.statusCode).toBe(400);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });
  });

  describe('GET /api/v1/users', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/users');

      expect(response.statusCode).toBe(401);
    });

    it('should reject non-admin users', async () => {
      const user = await createUser();

      const response = await request(app)
        .get('/api/v1/users')
        .set(
          'Authorization',
          `Bearer ${user.accessToken}`
        );

      expect(response.statusCode).toBe(403);

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'You do not have permission to perform this action',
      });
    });

    it('should return paginated users for an admin', async () => {
      const admin = await getAdminUser();

      await createUser({
        firstName: 'Alice',
        lastName: 'AdminTest',
      });

      await createUser({
        firstName: 'Bob',
        lastName: 'StudentTest',
      });

      const response = await request(app)
        .get('/api/v1/users')
        .query({
          page: 1,
          limit: 10,
          sortBy: 'firstName',
          sortOrder: 'asc',
        })
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body.status).toBe(
        'success'
      );

      expect(response.body.message).toBe(
        'Users retrieved successfully'
      );

      expect(
        Array.isArray(response.body.data)
      ).toBe(true);

      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 10,
        totalUsers: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should filter users by role', async () => {
      const admin = await getAdminUser();

      await createUser({
        role: 'instructor',
        firstName: 'Instructor',
        lastName: 'User',
      });

      await createUser({
        role: 'student',
        firstName: 'Student',
        lastName: 'User',
      });

      const response = await request(app)
        .get('/api/v1/users')
        .query({
          role: 'instructor',
        })
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body.data).toHaveLength(1);

      expect(
        response.body.data[0].role
      ).toBe('instructor');
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    it('should allow admin to retrieve a user', async () => {
      const admin = await getAdminUser();

      const student = await createUser({
        firstName: 'Target',
        lastName: 'User',
      });

      const response = await request(app)
        .get(
          `/api/v1/users/${student.user._id}`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'User retrieved successfully',
        data: {
          _id: student.user._id,
          email: student.email,
          firstName: 'Target',
          lastName: 'User',
        },
      });
    });

    it('should return 404 for a non-existing user', async () => {
      const admin = await getAdminUser();

      const response = await request(app)
        .get(
          '/api/v1/users/68c123456789abcdef123456'
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        );

      expect(response.statusCode).toBe(404);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'User not found',
      });
    });

    it('should reject an invalid user id', async () => {
      const admin = await getAdminUser();

      const response = await request(app)
        .get(
          '/api/v1/users/not-a-valid-id'
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        );

      expect(response.statusCode).toBe(400);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });
  });

  describe('PATCH /api/v1/users/:userId', () => {
    it('should allow admin to update role and active status', async () => {
      const admin = await getAdminUser();

      const student = await createUser();

      const response = await request(app)
        .patch(
          `/api/v1/users/${student.user._id}`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        )
        .send({
          role: 'instructor',
          isActive: false,
        });

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'User updated successfully',
        data: {
          _id: student.user._id,
          role: 'instructor',
          isActive: false,
        },
      });
    });

    it('should reject non-admin users', async () => {
      const student = await createUser();

      const target = await createUser();

      const response = await request(app)
        .patch(
          `/api/v1/users/${target.user._id}`
        )
        .set(
          'Authorization',
          `Bearer ${student.accessToken}`
        )
        .send({
          role: 'instructor',
        });

      expect(response.statusCode).toBe(403);
    });

    it('should reject invalid admin update data', async () => {
      const admin = await getAdminUser();

      const student = await createUser();

      const response = await request(app)
        .patch(
          `/api/v1/users/${student.user._id}`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        )
        .send({
          firstName: 'NotAllowed',
        });

      expect(response.statusCode).toBe(400);

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Validation failed',
      });
    });
  });

  describe('PATCH /api/v1/users/:userId/deactivate', () => {
    it('should deactivate a user as admin', async () => {
      const admin = await getAdminUser();

      const student = await createUser();

      const response = await request(app)
        .patch(
          `/api/v1/users/${student.user._id}/deactivate`
        )
        .set(
          'Authorization',
          `Bearer ${admin.accessToken}`
        );

      expect(response.statusCode).toBe(200);

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'User deactivated successfully',
        data: {
          _id: student.user._id,
          isActive: false,
        },
      });
    });

    it('should reject non-admin users', async () => {
      const student = await createUser();

      const target = await createUser();

      const response = await request(app)
        .patch(
          `/api/v1/users/${target.user._id}/deactivate`
        )
        .set(
          'Authorization',
          `Bearer ${student.accessToken}`
        );

      expect(response.statusCode).toBe(403);
    });
  });
});