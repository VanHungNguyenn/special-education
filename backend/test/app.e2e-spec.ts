import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app.js';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the error envelope for an unknown route under /api/v1', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/khong-ton-tai').expect(404);
    expect(response.body).toEqual({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy.', details: [] } });
  });

  it('rejects malformed JSON without leaking the parser message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/anything')
      .set('content-type', 'application/json')
      .send('{bad')
      .expect(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
    expect(JSON.stringify(response.body)).not.toContain('JSON');
  });
});
