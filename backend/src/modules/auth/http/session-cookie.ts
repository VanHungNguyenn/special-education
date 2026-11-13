import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Response } from 'express';
import type { Env } from '../../../config/env.validation.js';
import { REMEMBER_DAYS } from '../domain/session.js';

export const SESSION_COOKIE = 'sid';

@Injectable()
export class SessionCookie {
  private readonly options: CookieOptions;

  constructor(config: ConfigService<Env, true>) {
    const secure = config.get('COOKIE_SECURE', { infer: true }) ?? config.get('NODE_ENV', { infer: true }) === 'production';
    this.options = { httpOnly: true, sameSite: 'lax', secure, path: '/' };
  }

  set(response: Response, token: string, remember: boolean) {
    response.cookie(SESSION_COOKIE, token, remember ? { ...this.options, maxAge: REMEMBER_DAYS * 86_400_000 } : this.options);
  }

  clear(response: Response) {
    response.clearCookie(SESSION_COOKIE, this.options);
  }
}
