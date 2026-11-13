import { createParamDecorator, SetMetadata, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { Session } from '../domain/session.js';
import type { Role, User } from '../domain/user.js';

export type AuthenticatedRequest = Request & { auth?: { user: User; session: Session } };

export const IS_PUBLIC = 'auth:isPublic';
export const ROLES = 'auth:roles';

export const Public = () => SetMetadata(IS_PUBLIC, true);

export const Roles = (...roles: Role[]) => SetMetadata(ROLES, roles);

const authOf = (context: ExecutionContext) => {
  const auth = context.switchToHttp().getRequest<AuthenticatedRequest>().auth;
  if (!auth) throw new Error('Route is public: no authenticated user available');
  return auth;
};

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext) => authOf(context).user);

export const CurrentSession = createParamDecorator((_: unknown, context: ExecutionContext) => authOf(context).session);
