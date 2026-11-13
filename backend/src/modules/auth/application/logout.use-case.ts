import { Inject, Injectable } from '@nestjs/common';
import { SESSION_REPOSITORY, type SessionRepository } from '../domain/ports.js';

@Injectable()
export class LogoutUseCase {
  constructor(@Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository) {}

  execute(sessionId: string) {
    return this.sessions.delete(sessionId);
  }
}
