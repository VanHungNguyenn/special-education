import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app.js';

describe('API docs (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the OpenAPI document with prefixed paths', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/docs-json').expect(200);
    expect(response.body.openapi).toMatch(/^3\./);
    expect(Object.keys(response.body.paths)).toEqual(expect.arrayContaining(['/api/v1/health', '/api/v1/template/notes']));
  });

  it('serves the Swagger UI', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/docs').expect(200);
    expect(response.text).toContain('swagger-ui');
  });
});
