import { Inject, Injectable } from '@nestjs/common';
import { wrongPassword } from '../domain/auth-errors.js';
import { assertValidPassword } from '../domain/password-policy.js';
import { PASSWORD_HASHER, SESSION_REPOSITORY, USER_REPOSITORY, type PasswordHasher, type SessionRepository, type UserRepository } from '../domain/ports.js';
import type { User } from '../domain/user.js';

@Injectable()
export class ChangeOwnPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: { user: User; sessionId: string; currentPassword: string; newPassword: string }): Promise<void> {
    const { user, sessionId, currentPassword, newPassword } = input;
    if (!(await this.hasher.verify(currentPassword, user.passwordHash))) throw wrongPassword();
    assertValidPassword(newPassword);
    user.changePassword(await this.hasher.hash(newPassword));
    await this.users.save(user);
    await this.sessions.deleteAllForUser(user.id, sessionId);
  }
}
