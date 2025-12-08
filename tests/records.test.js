const request = require('supertest');
const app = require('../src/app');

describe('GET /api/records', () => {
  it('returns JSON array of records', async () => {
    const res = await request(app).get('/api/records');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
  });
});
