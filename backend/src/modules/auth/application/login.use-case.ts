import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { invalidCredentials } from '../domain/auth-errors.js';
import {
  CLOCK,
  PASSWORD_HASHER,
  SESSION_REPOSITORY,
  USER_REPOSITORY,
  type Clock,
  type PasswordHasher,
  type SessionRepository,
  type UserRepository,
} from '../domain/ports.js';
import { Session } from '../domain/session.js';
import { normalizeEmail, type User } from '../domain/user.js';
import { generateSessionToken, hashSessionToken } from './session-token.js';

@Injectable()
export class LoginUseCase {
  private dummyHash?: Promise<string>;

  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(input: { email: string; password: string; remember: boolean }): Promise<{ user: User; token: string; session: Session }> {
    const now = this.clock.now();
    const user = await this.users.findByEmail(normalizeEmail(input.email));
    if (!user) {
      this.dummyHash ??= this.hasher.hash(randomUUID());
      await this.hasher.verify(input.password, await this.dummyHash);
      throw invalidCredentials();
    }
    user.assertNotLocked(now);
    if (!(await this.hasher.verify(input.password, user.passwordHash))) {
      user.registerFailedLogin(now);
      await this.users.save(user);
      throw invalidCredentials();
    }
    user.assertActive();
    user.registerSuccessfulLogin();
    await this.users.save(user);

    const token = generateSessionToken();
    const session = Session.start({ id: randomUUID(), tokenHash: hashSessionToken(token), userId: user.id, remember: input.remember, now });
    await this.sessions.save(session);
    await this.sessions.deleteExpired(now);
    return { user, token, session };
  }
}
