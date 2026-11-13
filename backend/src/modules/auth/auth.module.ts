import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticateSessionUseCase } from './application/authenticate-session.use-case.js';
import { LoginUseCase } from './application/login.use-case.js';
import { LogoutUseCase } from './application/logout.use-case.js';
import { CLOCK, PASSWORD_HASHER, SESSION_REPOSITORY, USER_REPOSITORY } from './domain/ports.js';
import { AuthController } from './http/auth.controller.js';
import { SessionCookie } from './http/session-cookie.js';
import { SessionGuard } from './http/session.guard.js';
import { PrismaSessionRepository } from './infrastructure/prisma-session.repository.js';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository.js';
import { ScryptPasswordHasher } from './infrastructure/scrypt-password-hasher.js';
import { SystemClock } from './infrastructure/system-clock.js';

@Module({
  controllers: [AuthController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: PASSWORD_HASHER, useClass: ScryptPasswordHasher },
    { provide: CLOCK, useClass: SystemClock },
    LoginUseCase,
    AuthenticateSessionUseCase,
    LogoutUseCase,
    SessionCookie,
    { provide: APP_GUARD, useClass: SessionGuard },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER, CLOCK],
})
export class AuthModule {}
