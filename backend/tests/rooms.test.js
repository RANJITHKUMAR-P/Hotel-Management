import request from 'supertest';
import app from '../src/index.js';

describe('Rooms API', () => {
  let authToken;

  beforeAll(async () => {
    // Login to get token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'admin1234'
      });
    
    authToken = response.body.token;
  });

  test('GET /api/rooms returns all rooms', async () => {
    const response = await request(app)
      .get('/api/rooms')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});