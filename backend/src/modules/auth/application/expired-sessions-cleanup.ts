import { Inject, Injectable, Logger, type OnApplicationBootstrap } from '@nestjs/common';
import { CLOCK, SESSION_REPOSITORY, type Clock, type SessionRepository } from '../domain/ports.js';

@Injectable()
export class ExpiredSessionsCleanup implements OnApplicationBootstrap {
  private readonly logger = new Logger(ExpiredSessionsCleanup.name);

  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  onApplicationBootstrap() {
    this.sessions.deleteExpired(this.clock.now()).then(
      (count) => count > 0 && this.logger.log(`Removed ${count} expired sessions`),
      (error: unknown) => this.logger.warn(`Could not remove expired sessions: ${error instanceof Error ? error.message : String(error)}`),
    );
  }
}
