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
});
