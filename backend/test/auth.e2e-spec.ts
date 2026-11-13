import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createUser, loginAs, type TestUser } from './utils/auth.js';
import { createTestApp } from './utils/create-test-app.js';
import { resetDb } from './utils/reset-db.js';

const cookieOf = (response: request.Response) => ([] as string[]).concat(response.headers['set-cookie'] ?? []).find((c) => c.startsWith('sid=')) ?? '';

describe('auth (e2e)', () => {
  let app: INestApplication;
  let teacher: TestUser;
  const api = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDb(app);
    teacher = await createUser(app, { email: 'co.linh@test.local', fullName: 'Nguyễn Hà Linh' });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('returns the user without secrets and sets a session cookie', async () => {
      const response = await api().post('/api/v1/auth/login').send({ email: '  CO.LINH@test.local ', password: teacher.password }).expect(200);
      expect(response.body).toEqual({
        id: teacher.id,
        email: 'co.linh@test.local',
        fullName: 'Nguyễn Hà Linh',
        phone: '',
        role: 'TEACHER',
        isActive: true,
        lockedUntil: null,
      });
      const cookie = cookieOf(response);
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/SameSite=Lax/);
      expect(cookie).toMatch(/Path=\//);
      expect(cookie).not.toMatch(/Max-Age|Expires/);
    });

    it('sets a 30-day cookie when remember is true', async () => {
      const response = await api().post('/api/v1/auth/login').send({ email: teacher.email, password: teacher.password, remember: true }).expect(200);
      expect(cookieOf(response)).toMatch(/Max-Age=2592000/);
    });

    it('answers unknown email and wrong password identically', async () => {
      const unknown = await api().post('/api/v1/auth/login').send({ email: 'khong-co@test.local', password: 'whatever1' }).expect(401);
      const wrong = await api().post('/api/v1/auth/login').send({ email: teacher.email, password: 'sai-mat-khau' }).expect(401);
      expect(unknown.body).toEqual(wrong.body);
      expect(wrong.body.error).toEqual({ code: 'INVALID_CREDENTIALS', message: 'Email hoặc mật khẩu không đúng.', details: [] });
    });

    it('rejects a malformed body', async () => {
      const response = await api().post('/api/v1/auth/login').send({ email: 'not-an-email', password: 1 }).expect(400);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('stores only a hash of the session token', async () => {
      const response = await api().post('/api/v1/auth/login').send({ email: teacher.email, password: teacher.password }).expect(200);
      const token = cookieOf(response).split(';')[0].slice('sid='.length);
      const sessions = await app.get(PrismaService).session.findMany();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].tokenHash).toMatch(/^[0-9a-f]{64}$/);
      expect(sessions[0].tokenHash).not.toBe(token);
    });
  });

  describe('lockout and timing', () => {
    it('locks the account after five wrong passwords, even for the right one', async () => {
      for (let i = 0; i < 5; i++) await api().post('/api/v1/auth/login').send({ email: teacher.email, password: 'sai-mat-khau' }).expect(401);
      const response = await api().post('/api/v1/auth/login').send({ email: teacher.email, password: teacher.password }).expect(423);
      expect(response.body.error.code).toBe('ACCOUNT_LOCKED');
      expect(response.body.error.message).toMatch(/15 phút/);
    });

    it('takes about as long for an unknown email as for a wrong password', async () => {
      const time = async (email: string) => {
        const started = performance.now();
        await api().post('/api/v1/auth/login').send({ email, password: 'sai-mat-khau' }).expect(401);
        return performance.now() - started;
      };
      await time('warmup@test.local');
      const average = async (email: string) => {
        let total = 0;
        for (let i = 0; i < 4; i++) total += await time(email);
        return total / 4;
      };
      const unknown = await average('khong-ton-tai@test.local');
      const wrong = await average(teacher.email);
      expect(Math.abs(unknown - wrong) / Math.max(unknown, wrong)).toBeLessThan(0.5);
    });
  });

  describe('session guard', () => {
    it('rejects /auth/me without a cookie or with a forged one', async () => {
      await api().get('/api/v1/auth/me').expect(401, { error: { code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', details: [] } });
      await api().get('/api/v1/auth/me').set('cookie', 'sid=forged').expect(401);
    });

    it('returns the current user for a valid session', async () => {
      const agent = await loginAs(app, teacher);
      const response = await agent.get('/api/v1/auth/me').expect(200);
      expect(response.body.email).toBe(teacher.email);
    });

    it('keeps /health public', async () => {
      await api().get('/api/v1/health').expect(200);
    });
  });

  describe('PUT /auth/me/password', () => {
    it('rejects a wrong current password and a too-short new one', async () => {
      const agent = await loginAs(app, teacher);
      const wrong = await agent.put('/api/v1/auth/me/password').send({ currentPassword: 'sai-mat-khau', newPassword: 'mat-khau-moi-1' }).expect(400);
      expect(wrong.body.error.code).toBe('WRONG_PASSWORD');
      const short = await agent.put('/api/v1/auth/me/password').send({ currentPassword: teacher.password, newPassword: 'ngan' }).expect(400);
      expect(short.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('changes the password and signs out every other session', async () => {
      const current = await loginAs(app, teacher);
      const other = await loginAs(app, teacher);
      await current.put('/api/v1/auth/me/password').send({ currentPassword: teacher.password, newPassword: 'mat-khau-moi-1' }).expect(204);
      await current.get('/api/v1/auth/me').expect(200);
      await other.get('/api/v1/auth/me').expect(401);
      await api().post('/api/v1/auth/login').send({ email: teacher.email, password: teacher.password }).expect(401);
      await api().post('/api/v1/auth/login').send({ email: teacher.email, password: 'mat-khau-moi-1' }).expect(200);
    });
  });

  describe('POST /auth/logout', () => {
    it('ends the session and clears the cookie', async () => {
      const login = await api().post('/api/v1/auth/login').send({ email: teacher.email, password: teacher.password }).expect(200);
      const cookie = cookieOf(login).split(';')[0];
      const logout = await api().post('/api/v1/auth/logout').set('cookie', cookie).expect(204);
      expect(cookieOf(logout)).toMatch(/sid=;/);
      await api().get('/api/v1/auth/me').set('cookie', cookie).expect(401);
    });
  });
});
