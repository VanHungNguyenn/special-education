import { Inject, Injectable } from '@nestjs/common';
import { userNotFound } from '../domain/auth-errors.js';
import { assertValidPassword } from '../domain/password-policy.js';
import { PASSWORD_HASHER, SESSION_REPOSITORY, USER_REPOSITORY, type PasswordHasher, type SessionRepository, type UserRepository } from '../domain/ports.js';

@Injectable()
export class ResetUserPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: { id: string; password: string }): Promise<void> {
    const target = await this.users.findById(input.id);
    if (!target) throw userNotFound();
    assertValidPassword(input.password);
    target.changePassword(await this.hasher.hash(input.password));
    await this.users.save(target);
    await this.sessions.deleteAllForUser(target.id);
  }
}
