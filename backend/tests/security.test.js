import request from 'supertest';
import app from '../src/index.js';

describe('Security Tests', () => {
  test('should reject requests without authentication token for protected routes', async () => {
    const response = await request(app).get('/api/rooms');
    expect(response.status).toBe(401);
  });

  test('should reject requests with invalid token', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(response.status).toBe(401);
  });

  test('should prevent SQL injection attempts', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: "admin' OR '1'='1",
        password: "password"
      });
    
    // Should not reveal database errors
    expect(response.status).not.toBe(500);
  });
});