import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { AuthenticateSessionUseCase } from '../application/authenticate-session.use-case.js';
import { unauthenticated } from '../domain/auth-errors.js';
import { IS_PUBLIC, type AuthenticatedRequest } from './decorators.js';
import { SESSION_COOKIE, SessionCookie } from './session-cookie.js';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authenticate: AuthenticateSessionUseCase,
    private readonly cookie: SessionCookie,
  ) {}

  async canActivate(context: ExecutionContext) {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()])) return true;
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();
    const token: unknown = request.cookies?.[SESSION_COOKIE];
    if (typeof token !== 'string' || !token) throw unauthenticated();
    const { user, session, renewed } = await this.authenticate.execute(token);
    if (renewed) this.cookie.set(http.getResponse<Response>(), token, true);
    request.auth = { user, session };
    return true;
  }
}
