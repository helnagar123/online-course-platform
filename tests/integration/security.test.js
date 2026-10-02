import request from 'supertest';

import './setup.js';

process.env.CORS_ORIGINS =
  'http://localhost:3000';

const { default: app } = await import(
  '../../src/app.js'
);

describe('Security Middleware', () => {
  describe('Security headers', () => {
    it('should include Helmet security headers', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.statusCode).toBe(200);

      expect(
        response.headers['x-content-type-options']
      ).toBe('nosniff');

      expect(
        response.headers['x-frame-options']
      ).toBe('SAMEORIGIN');

      expect(
        response.headers['x-powered-by']
      ).toBeUndefined();
    });
  });

  describe('CORS', () => {
    it('should allow requests from an allowed origin', async () => {
      const response = await request(app)
        .get('/health')
        .set(
          'Origin',
          'http://localhost:3000'
        );

      expect(response.statusCode).toBe(200);

      expect(
        response.headers['access-control-allow-origin']
      ).toBe('http://localhost:3000');
    });

    it('should reject requests from a disallowed origin', async () => {
      const response = await request(app)
        .get('/health')
        .set(
          'Origin',
          'https://evil.example.com'
        );

      expect(response.statusCode).toBe(403);

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Origin not allowed by CORS'
      });
    });
  });

  describe('Malformed JSON', () => {
    it('should reject invalid JSON payloads', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set(
          'Content-Type',
          'application/json'
        )
        .send(
          '{"email":"test@example.com",'
        );

      expect(response.statusCode).toBe(400);

      expect(response.body).toMatchObject({
        status: 'error',
        message:
          'Invalid JSON payload'
      });
    });
  });
});