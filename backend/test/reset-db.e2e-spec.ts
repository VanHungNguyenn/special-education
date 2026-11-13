import type { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp } from './utils/create-test-app.js';
import { resetDb } from './utils/reset-db.js';

describe('resetDb (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    await prisma.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS reset_probe (id serial PRIMARY KEY)');
  });

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS reset_probe');
    await app.close();
  });

  it('empties every table except the migration history', async () => {
    await prisma.$executeRawUnsafe('INSERT INTO reset_probe DEFAULT VALUES');
    await resetDb(app);
    const [{ rows }] = await prisma.$queryRaw<{ rows: bigint }[]>`SELECT count(*) AS rows FROM reset_probe`;
    const [{ migrations }] = await prisma.$queryRaw<{ migrations: bigint }[]>`SELECT count(*) AS migrations FROM _prisma_migrations`;
    expect(rows).toBe(0n);
    expect(migrations).toBeGreaterThan(0n);
  });
});
