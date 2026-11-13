import { NestFactory } from '@nestjs/core';
import { pathToFileURL } from 'node:url';
import { AppModule } from '../app.module.js';
import { CreateUserUseCase, USER_REPOSITORY, type UserRepository } from '../modules/auth/index.js';

const REQUIRED = ['SEED_MANAGER_EMAIL', 'SEED_MANAGER_PASSWORD', 'SEED_MANAGER_NAME'] as const;

export const createFirstManager = async (env: Record<string, string | undefined> = process.env): Promise<'created' | 'exists'> => {
  const missing = REQUIRED.filter((key) => !env[key]?.trim());
  if (missing.length > 0) throw new Error(`Thiếu biến môi trường: ${missing.join(', ')}`);
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  try {
    if ((await app.get<UserRepository>(USER_REPOSITORY).countActiveManagers()) > 0) return 'exists';
    await app.get(CreateUserUseCase).execute({
      email: env.SEED_MANAGER_EMAIL!,
      password: env.SEED_MANAGER_PASSWORD!,
      fullName: env.SEED_MANAGER_NAME!,
      phone: '',
      role: 'MANAGER',
    });
    return 'created';
  } finally {
    await app.close();
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  createFirstManager()
    .then((result) => {
      console.log(result === 'created' ? 'Đã tạo tài khoản Quản lý.' : 'Đã có Quản lý đang hoạt động, không tạo thêm.');
      process.exit(0);
    })
    .catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
