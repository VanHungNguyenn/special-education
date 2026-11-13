import { Inject, Injectable } from '@nestjs/common';
import { unauthenticated } from '../domain/auth-errors.js';
import { CLOCK, SESSION_REPOSITORY, USER_REPOSITORY, type Clock, type SessionRepository, type UserRepository } from '../domain/ports.js';
import type { Session } from '../domain/session.js';
import type { User } from '../domain/user.js';
import { hashSessionToken } from './session-token.js';

@Injectable()
export class AuthenticateSessionUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(token: string): Promise<{ user: User; session: Session; renewed: boolean }> {
    const now = this.clock.now();
    const session = await this.sessions.findByTokenHash(hashSessionToken(token));
    if (!session) throw unauthenticated();
    if (session.isExpired(now)) {
      await this.sessions.delete(session.id);
      throw unauthenticated();
    }
    const user = await this.users.findById(session.userId);
    if (!user?.isActive) throw unauthenticated();
    const renewed = session.renew(now);
    if (renewed) await this.sessions.save(session);
    return { user, session, renewed };
  }
}
