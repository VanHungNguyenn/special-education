import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils/create-test-app.js';

describe('_template module (e2e)', () => {
  let app: INestApplication;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a note (201) and reads it back', async () => {
    const created = await api().post('/api/v1/template/notes').send({ title: ' Ghi chú ' }).expect(201);
    expect(created.body).toEqual({ id: expect.any(String), title: 'Ghi chú' });
    await api().get(`/api/v1/template/notes/${created.body.id}`).expect(200, created.body);
  });

  it('returns 400 VALIDATION_FAILED with details for a malformed body', async () => {
    const response = await api().post('/api/v1/template/notes').send({ title: 123, extra: true }).expect(400);
    expect(response.body.error.code).toBe('VALIDATION_FAILED');
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        { field: 'title', message: 'Tiêu đề phải là chuỗi.' },
        { field: 'extra', message: expect.any(String) },
      ]),
    );
    expect(response.body.error.details).toHaveLength(2);
  });

  it('returns the domain error when a business rule fails', async () => {
    const response = await api().post('/api/v1/template/notes').send({ title: '   ' }).expect(422);
    expect(response.body.error.code).toBe('NOTE_TITLE_REQUIRED');
  });

  it('returns 404 with the domain code for an unknown note', async () => {
    const response = await api().get('/api/v1/template/notes/00000000-0000-4000-8000-000000000000').expect(404);
    expect(response.body.error).toEqual({ code: 'NOTE_NOT_FOUND', message: 'Không tìm thấy ghi chú.', details: [] });
  });

  it('returns 500 INTERNAL_ERROR without leaking the cause', async () => {
    const response = await api().get('/api/v1/template/boom').expect(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.toContain('boom');
  });
});
