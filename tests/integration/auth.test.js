import request from 'supertest';

import './setup.js';

process.env.AUTH_RATE_LIMIT_MAX = '1000';

const { default: app } = await import(
  '../../src/app.js'
);

const createUserPayload = () => ({
  firstName: 'Hassan',
  lastName: 'Elnagar',
  email: `hassan.${Date.now()}@example.com`,
  password: 'Password123!',
  role: 'student',
});

describe('Authentication API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const payload =
        createUserPayload();

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(payload);

      expect(response.statusCode).toBe(201);

      expect(response.body.status).toBe(
        'success'
      );

      expect(response.body.message).toBe(
        'User registered successfully'
      );

      expect(
        response.body.data
      ).toMatchObject({
        user: {
          firstName: 'Hassan',
          lastName: 'Elnagar',
          email: payload.email,
          role: 'student',
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      expect(
        response.body.data.user.password
      ).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const payload =
        createUserPayload();

      const firstResponse =
        await request(app)
          .post('/api/v1/auth/register')
          .send(payload);

      expect(
        firstResponse.statusCode
      ).toBe(201);

      const secondResponse =
        await request(app)
          .post('/api/v1/auth/register')
          .send(payload);

      expect(
        secondResponse.statusCode
      ).toBe(409);

      expect(
        secondResponse.body
      ).toMatchObject({
        status: 'error',
        message: 'Email is already registered',
      });
    });

    it('should reject invalid registration data', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'H',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.statusCode).toBe(
        400
      );

      expect(response.body.status).toBe(
        'error'
      );

      expect(response.body.message).toBe(
        'Validation failed'
      );

      expect(
        response.body.errors
      ).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const payload =
        createUserPayload();

      await request(app)
        .post('/api/v1/auth/register')
        .send(payload)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: payload.email,
          password: payload.password,
        });

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            email: payload.email,
          },
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });
    });

    it('should reject invalid credentials', async () => {
      const payload =
        createUserPayload();

      await request(app)
        .post('/api/v1/auth/register')
        .send(payload)
        .expect(201);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: payload.email,
          password: 'WrongPassword123!',
        });

      expect(response.statusCode).toBe(
        401
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Invalid email or password',
      });
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me');

      expect(response.statusCode).toBe(
        401
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Authentication required',
      });
    });

    it('should return the current authenticated user', async () => {
      const payload =
        createUserPayload();

      const registerResponse =
        await request(app)
          .post('/api/v1/auth/register')
          .send(payload)
          .expect(201);

      const accessToken =
        registerResponse.body.data
          .accessToken;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set(
          'Authorization',
          `Bearer ${accessToken}`
        );

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Current user retrieved successfully',
        data: {
          email: payload.email,
          firstName: 'Hassan',
          lastName: 'Elnagar',
          role: 'student',
        },
      });
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token', async () => {
      const payload =
        createUserPayload();

      const registerResponse =
        await request(app)
          .post('/api/v1/auth/register')
          .send(payload)
          .expect(201);

      const oldRefreshToken =
        registerResponse.body.data
          .refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken:
            oldRefreshToken,
        });

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message:
          'Access token refreshed successfully',
        data: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        },
      });

      expect(
        response.body.data.refreshToken
      ).not.toBe(oldRefreshToken);
    });

    it('should reject an invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken:
            'invalid-refresh-token',
        });

      expect(response.statusCode).toBe(
        401
      );

      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Invalid refresh token',
      });
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const payload =
        createUserPayload();

      const registerResponse =
        await request(app)
          .post('/api/v1/auth/register')
          .send(payload)
          .expect(201);

      const refreshToken =
        registerResponse.body.data
          .refreshToken;

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .send({
          refreshToken,
        });

      expect(response.statusCode).toBe(
        200
      );

      expect(response.body).toMatchObject({
        status: 'success',
        message: 'Logout successful',
      });

      const refreshResponse =
        await request(app)
          .post('/api/v1/auth/refresh')
          .send({
            refreshToken,
          });

      expect(
        refreshResponse.statusCode
      ).toBe(401);
    });
  });
});