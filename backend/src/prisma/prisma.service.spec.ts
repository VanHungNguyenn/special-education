import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaModule } from './prisma.module.js';
import { PrismaService } from './prisma.service.js';

const unreachable = 'postgresql://u:p@127.0.0.1:1/none';

const createModule = () =>
  Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => ({ DATABASE_URL: unreachable })] }), PrismaModule],
  }).compile();

describe('PrismaService', () => {
  it('lets the app start while the database is unreachable', async () => {
    const moduleRef = await createModule();
    const app = moduleRef.createNestApplication();
    await expect(app.init()).resolves.toBe(app);
    await app.close();
  });

  it('fails only when a query actually runs', async () => {
    const moduleRef = await createModule();
    await expect(moduleRef.get(PrismaService).$queryRaw`SELECT 1`).rejects.toThrow();
    await moduleRef.close();
  });
});
