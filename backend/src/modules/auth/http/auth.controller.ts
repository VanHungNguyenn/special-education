import { Body, Controller, Get, HttpCode, Post, Put, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ChangeOwnPasswordUseCase } from '../application/change-own-password.use-case.js';
import { LoginUseCase } from '../application/login.use-case.js';
import { LogoutUseCase } from '../application/logout.use-case.js';
import type { Session } from '../domain/session.js';
import type { User } from '../domain/user.js';
import { ChangePasswordRequest, LoginRequest, UserResponse } from './auth.dto.js';
import { CurrentSession, CurrentUser, Public } from './decorators.js';
import { SessionCookie } from './session-cookie.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly login: LoginUseCase,
    private readonly logout: LogoutUseCase,
    private readonly changeOwnPassword: ChangeOwnPasswordUseCase,
    private readonly cookie: SessionCookie,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async logIn(@Body() body: LoginRequest, @Res({ passthrough: true }) response: Response): Promise<UserResponse> {
    const remember = body.remember ?? false;
    const { user, token } = await this.login.execute({ email: body.email, password: body.password, remember });
    this.cookie.set(response, token, remember);
    return UserResponse.from(user);
  }

  @Get('me')
  me(@CurrentUser() user: User): UserResponse {
    return UserResponse.from(user);
  }

  @Put('me/password')
  @HttpCode(204)
  async changePassword(@CurrentUser() user: User, @CurrentSession() session: Session, @Body() body: ChangePasswordRequest): Promise<void> {
    await this.changeOwnPassword.execute({ user, sessionId: session.id, currentPassword: body.currentPassword, newPassword: body.newPassword });
  }

  @Post('logout')
  @HttpCode(204)
  async logOut(@CurrentSession() session: Session, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.logout.execute(session.id);
    this.cookie.clear(response);
  }
}
