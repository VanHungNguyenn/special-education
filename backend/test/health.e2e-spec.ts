import type { INestApplication } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import request from 'supertest';
import type { Env } from '../src/config/env.validation.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './utils/create-test-app.js';

describe('GET /api/v1/health (e2e)', () => {
  describe('when the database is reachable', () => {
    let app: INestApplication;

    beforeAll(async () => {
      app = await createTestApp();
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns 200 ok', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
      expect(response.body).toEqual({ status: 'ok', db: 'ok' });
    });
  });

  describe('when the database is unreachable', () => {
    let app: INestApplication;

    beforeAll(async () => {
      const config = { get: () => 'postgresql://u:p@127.0.0.1:1/none_test' } as unknown as ConfigService<Env, true>;
      app = await createTestApp((builder) => builder.overrideProvider(PrismaService).useValue(new PrismaService(config)));
    });

    afterAll(async () => {
      await app.close();
    });

    it('returns 503 within 3 seconds', async () => {
      const started = Date.now();
      const response = await request(app.getHttpServer()).get('/api/v1/health').expect(503);
      expect(response.body).toEqual({ status: 'error', db: 'down' });
      expect(Date.now() - started).toBeLessThan(3000);
    });
  });
});
