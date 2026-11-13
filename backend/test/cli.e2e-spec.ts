import type { INestApplication } from '@nestjs/common';
import { createFirstManager } from '../src/cli/create-manager.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { loginAs } from './utils/auth.js';
import { createTestApp } from './utils/create-test-app.js';
import { resetDb } from './utils/reset-db.js';

describe('createFirstManager (e2e)', () => {
  let app: INestApplication;
  const env = { SEED_MANAGER_EMAIL: ' Admin@Test.Local ', SEED_MANAGER_PASSWORD: 'mat-khau-quan-ly', SEED_MANAGER_NAME: 'Quản Lý Đầu Tiên' };

  beforeAll(async () => {
    app = await createTestApp();
    await resetDb(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates the first manager once, then does nothing', async () => {
    await expect(createFirstManager(env)).resolves.toBe('created');
    await expect(createFirstManager({ ...env, SEED_MANAGER_EMAIL: 'other@test.local' })).resolves.toBe('exists');
    expect(await app.get(PrismaService).user.count({ where: { role: 'MANAGER' } })).toBe(1);
    const agent = await loginAs(app, { email: 'admin@test.local', password: env.SEED_MANAGER_PASSWORD });
    await agent.get('/api/v1/users').expect(200);
  });

  it('names every missing variable', async () => {
    await expect(createFirstManager({ SEED_MANAGER_EMAIL: 'x@test.local' })).rejects.toThrow('SEED_MANAGER_PASSWORD, SEED_MANAGER_NAME');
  });
});
