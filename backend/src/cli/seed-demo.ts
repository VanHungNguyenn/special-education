import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { CreateUserUseCase, USER_REPOSITORY, type UserRepository } from '../modules/auth/index.js';
import { PrismaService } from '../prisma/prisma.service.js';

const DEMO_DOMAIN = '@demo.local';
const DEMO_PASSWORD = 'demo2026';
const DEMO_USERS = [
  { email: `quanly${DEMO_DOMAIN}`, fullName: 'Quản Lý Demo', role: 'MANAGER' as const },
  { email: `linh${DEMO_DOMAIN}`, fullName: 'Nguyễn Hà Linh', role: 'TEACHER' as const },
  { email: `thu${DEMO_DOMAIN}`, fullName: 'Trần Minh Thư', role: 'TEACHER' as const },
  { email: `trang${DEMO_DOMAIN}`, fullName: 'Phạm Thu Trang', role: 'TEACHER' as const },
];

if (process.env.NODE_ENV === 'production') {
  console.error('Không chạy dữ liệu demo trên môi trường production.');
  process.exit(1);
}

const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
try {
  if (process.argv.includes('--clean')) {
    const { count } = await app.get(PrismaService).user.deleteMany({ where: { email: { endsWith: DEMO_DOMAIN } } });
    console.log(`Đã xóa ${count} tài khoản demo.`);
  } else {
    const users = app.get<UserRepository>(USER_REPOSITORY);
    for (const demo of DEMO_USERS) {
      if (await users.findByEmail(demo.email)) continue;
      await app.get(CreateUserUseCase).execute({ ...demo, phone: '', password: DEMO_PASSWORD });
    }
    console.log(`Tài khoản demo (mật khẩu ${DEMO_PASSWORD}): ${DEMO_USERS.map((user) => user.email).join(', ')}`);
  }
} finally {
  await app.close();
}
