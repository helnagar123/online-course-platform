import request from 'supertest';

import app from '../../src/app.js';

describe('Health Check API', () => {
  it('should return API health status', async () => {
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