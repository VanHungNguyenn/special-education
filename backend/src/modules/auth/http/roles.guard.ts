import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from '../domain/user.js';
import { ROLES, type AuthenticatedRequest } from './decorators.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES, [context.getHandler(), context.getClass()]);
    if (!roles) return true;
    const user = context.switchToHttp().getRequest<AuthenticatedRequest>().auth?.user;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException();
    return true;
  }
}
