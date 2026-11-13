import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticateSessionUseCase } from './application/authenticate-session.use-case.js';
import { ChangeOwnPasswordUseCase } from './application/change-own-password.use-case.js';
import { CreateUserUseCase } from './application/create-user.use-case.js';
import { ListUsersUseCase } from './application/list-users.use-case.js';
import { ResetUserPasswordUseCase } from './application/reset-user-password.use-case.js';
import { UpdateUserUseCase } from './application/update-user.use-case.js';
import { LoginUseCase } from './application/login.use-case.js';
import { LogoutUseCase } from './application/logout.use-case.js';
import { CLOCK, PASSWORD_HASHER, SESSION_REPOSITORY, USER_REPOSITORY } from './domain/ports.js';
import { AuthController } from './http/auth.controller.js';
import { RolesGuard } from './http/roles.guard.js';
import { UsersController } from './http/users.controller.js';
import { SessionCookie } from './http/session-cookie.js';
import { SessionGuard } from './http/session.guard.js';
import { PrismaSessionRepository } from './infrastructure/prisma-session.repository.js';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository.js';
import { ScryptPasswordHasher } from './infrastructure/scrypt-password-hasher.js';
import { SystemClock } from './infrastructure/system-clock.js';

@Module({
  controllers: [AuthController, UsersController],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: SESSION_REPOSITORY, useClass: PrismaSessionRepository },
    { provide: PASSWORD_HASHER, useClass: ScryptPasswordHasher },
    { provide: CLOCK, useClass: SystemClock },
    LoginUseCase,
    AuthenticateSessionUseCase,
    LogoutUseCase,
    ChangeOwnPasswordUseCase,
    ListUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    ResetUserPasswordUseCase,
    SessionCookie,
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [USER_REPOSITORY, PASSWORD_HASHER, CLOCK, CreateUserUseCase],
})
export class AuthModule {}
