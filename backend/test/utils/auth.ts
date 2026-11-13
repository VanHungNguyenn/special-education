import type { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { PASSWORD_HASHER, USER_REPOSITORY, type PasswordHasher, type UserRepository } from '../../src/modules/auth/domain/ports.js';
import { User, type Role } from '../../src/modules/auth/domain/user.js';

export const DEFAULT_PASSWORD = 'matkhau-dung-123';

const hashes = new Map<string, Promise<string>>();

export type TestUser = { id: string; email: string; password: string; role: Role };

export const createUser = async (
  app: INestApplication,
  overrides: { email?: string; password?: string; fullName?: string; role?: Role; isActive?: boolean } = {},
): Promise<TestUser> => {
  const password = overrides.password ?? DEFAULT_PASSWORD;
  if (!hashes.has(password)) hashes.set(password, app.get<PasswordHasher>(PASSWORD_HASHER).hash(password));
  const user = User.create({
    id: randomUUID(),
    email: overrides.email ?? `user-${randomUUID().slice(0, 8)}@test.local`,
    passwordHash: await hashes.get(password)!,
    fullName: overrides.fullName ?? 'Người Dùng Thử',
    phone: '',
    role: overrides.role ?? 'TEACHER',
  });
  if (overrides.isActive === false) user.setActive(false);
  await app.get<UserRepository>(USER_REPOSITORY).save(user);
  return { id: user.id, email: user.email, password, role: user.role };
};

export const loginAs = async (app: INestApplication, user: Pick<TestUser, 'email' | 'password'>, remember = false) => {
  const agent = request.agent(app.getHttpServer());
  await agent.post('/api/v1/auth/login').send({ email: user.email, password: user.password, remember }).expect(200);
  return agent;
};
