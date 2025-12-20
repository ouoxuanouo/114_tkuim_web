import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../src/app.js';

describe('Health check', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
