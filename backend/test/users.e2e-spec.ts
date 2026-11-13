import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent.js';
import { createUser, loginAs, type TestUser } from './utils/auth.js';
import { createTestApp } from './utils/create-test-app.js';
import { resetDb } from './utils/reset-db.js';

describe('users (e2e)', () => {
  let app: INestApplication;
  let manager: TestUser;
  let teacher: TestUser;
  let asManager: TestAgent;
  let asTeacher: TestAgent;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDb(app);
    manager = await createUser(app, { email: 'quanly@test.local', fullName: 'Bùi Quản Lý', role: 'MANAGER' });
    teacher = await createUser(app, { email: 'giaovien@test.local', fullName: 'An Giáo Viên', role: 'TEACHER' });
    asManager = await loginAs(app, manager);
    asTeacher = await loginAs(app, teacher);
  });

  afterAll(async () => {
    await app.close();
  });

  const newTeacher = { email: ' Moi.GV@Test.Local ', fullName: ' Trần Minh Thư ', phone: '0901234567', role: 'TEACHER', password: 'mat-khau-ban-dau' };

  describe('access', () => {
    it('requires a session and the MANAGER role', async () => {
      await request(app.getHttpServer()).get('/api/v1/users').expect(401);
      const response = await asTeacher.get('/api/v1/users').expect(403);
      expect(response.body.error).toEqual({ code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác này.', details: [] });
      await asTeacher.post('/api/v1/users').send(newTeacher).expect(403);
    });
  });

  describe('GET /users', () => {
    it('lists users sorted by full name', async () => {
      const response = await asManager.get('/api/v1/users').expect(200);
      expect(response.body.map((user: { fullName: string }) => user.fullName)).toEqual(['An Giáo Viên', 'Bùi Quản Lý']);
      expect(response.body[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('POST /users', () => {
    it('creates a user who can then log in', async () => {
      const response = await asManager.post('/api/v1/users').send(newTeacher).expect(201);
      expect(response.body).toMatchObject({ email: 'moi.gv@test.local', fullName: 'Trần Minh Thư', phone: '0901234567', role: 'TEACHER', isActive: true });
      await loginAs(app, { email: 'moi.gv@test.local', password: newTeacher.password });
    });

    it('rejects an email already in use, ignoring case', async () => {
      const response = await asManager.post('/api/v1/users').send({ ...newTeacher, email: 'GIAOVIEN@test.local' }).expect(409);
      expect(response.body.error.code).toBe('EMAIL_TAKEN');
    });

    it('rejects an invalid body with details', async () => {
      const response = await asManager
        .post('/api/v1/users')
        .send({ email: 'sai', fullName: '', role: 'ADMIN', password: 'ngan', isActive: false })
        .expect(400);
      expect(response.body.error.code).toBe('VALIDATION_FAILED');
      expect(response.body.error.details.map((detail: { field: string }) => detail.field).sort()).toEqual(['email', 'fullName', 'isActive', 'password', 'role']);
    });
  });

  describe('PATCH /users/:id', () => {
    it('updates profile fields and role', async () => {
      const response = await asManager
        .patch(`/api/v1/users/${teacher.id}`)
        .send({ fullName: ' An Giáo Viên Mới ', phone: '0909', email: 'Moi.Email@test.local' })
        .expect(200);
      expect(response.body).toMatchObject({ fullName: 'An Giáo Viên Mới', phone: '0909', email: 'moi.email@test.local', role: 'TEACHER' });
    });

    it('rejects an email used by someone else', async () => {
      const response = await asManager.patch(`/api/v1/users/${teacher.id}`).send({ email: manager.email }).expect(409);
      expect(response.body.error.code).toBe('EMAIL_TAKEN');
    });

    it('disabling a user ends their sessions and blocks login', async () => {
      await asManager.patch(`/api/v1/users/${teacher.id}`).send({ isActive: false }).expect(200);
      await asTeacher.get('/api/v1/auth/me').expect(401);
      const login = await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: teacher.email, password: teacher.password }).expect(403);
      expect(login.body.error.code).toBe('ACCOUNT_DISABLED');
      await asManager.patch(`/api/v1/users/${teacher.id}`).send({ isActive: true }).expect(200);
      await loginAs(app, teacher);
    });

    it('stops a manager from demoting or disabling themself', async () => {
      const demote = await asManager.patch(`/api/v1/users/${manager.id}`).send({ role: 'TEACHER' }).expect(409);
      expect(demote.body.error.code).toBe('CANNOT_CHANGE_SELF');
      await asManager.patch(`/api/v1/users/${manager.id}`).send({ isActive: false }).expect(409);
      await asManager.get('/api/v1/auth/me').expect(200);
    });

    it('lets a manager disable another manager', async () => {
      const other = await createUser(app, { role: 'MANAGER' });
      const asOther = await loginAs(app, other);
      await asManager.patch(`/api/v1/users/${other.id}`).send({ isActive: false }).expect(200);
      await asOther.get('/api/v1/auth/me').expect(401);
    });

    it('returns 404 for an unknown id and 400 for a non-UUID id', async () => {
      const missing = await asManager.patch('/api/v1/users/00000000-0000-4000-8000-000000000000').send({ fullName: 'X' }).expect(404);
      expect(missing.body.error.code).toBe('USER_NOT_FOUND');
      await asManager.patch('/api/v1/users/khong-phai-uuid').send({ fullName: 'X' }).expect(400);
    });
  });

  describe('PUT /users/:id/password', () => {
    it('resets the password, unlocks the account and ends its sessions', async () => {
      for (let i = 0; i < 5; i++) await request(app.getHttpServer()).post('/api/v1/auth/login').send({ email: teacher.email, password: 'sai-mat-khau' });
      await asManager.put(`/api/v1/users/${teacher.id}/password`).send({ password: 'mat-khau-dat-lai' }).expect(204);
      await asTeacher.get('/api/v1/auth/me').expect(401);
      await loginAs(app, { email: teacher.email, password: 'mat-khau-dat-lai' });
    });

    it('rejects a too-short password', async () => {
      await asManager.put(`/api/v1/users/${teacher.id}/password`).send({ password: 'ngan' }).expect(400);
    });
  });
});
