import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { emailTaken } from '../domain/auth-errors.js';
import { assertValidPassword } from '../domain/password-policy.js';
import { PASSWORD_HASHER, USER_REPOSITORY, type PasswordHasher, type UserRepository } from '../domain/ports.js';
import { normalizeEmail, User, type Role } from '../domain/user.js';

export type CreateUserInput = { email: string; fullName: string; phone: string; role: Role; password: string };

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: CreateUserInput): Promise<User> {
    if (await this.users.findByEmail(normalizeEmail(input.email))) throw emailTaken();
    assertValidPassword(input.password);
    const { password, email, fullName, phone, role } = input;
    const user = User.create({ id: randomUUID(), email, fullName, phone, role, passwordHash: await this.hasher.hash(password) });
    await this.users.save(user);
    return user;
  }
}
