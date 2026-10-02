import request from 'supertest';

import './setup.js';

const { default: app } = await import(
  '../../src/app.js'
);

describe('Health Check API', () => {
  describe('GET /health', () => {
    it('should return API liveness status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        status: 'success',
        message:
          'Online Course Platform API is running'
      });
    });
  });

  describe('GET /ready', () => {
    it('should return 200 when MongoDB is connected', async () => {
      const response = await request(app)
        .get('/ready');

      expect(response.statusCode).toBe(200);

      expect(response.body).toEqual({
        status: 'success',
        message:
          'Online Course Platform API is ready'
      });
    });
  });
});