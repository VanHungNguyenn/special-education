import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import type { PasswordHasher } from '../domain/ports.js';

const LOG_N = 17;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;

const derive = (password: string, salt: Buffer, options: ScryptOptions) =>
  new Promise<Buffer>((resolve, reject) =>
    scrypt(password.normalize('NFC'), salt, KEY_LENGTH, options, (error, key) => (error ? reject(error) : resolve(key))),
  );

const optionsFor = (logN: number, r: number, p: number): ScryptOptions => ({ N: 2 ** logN, r, p, maxmem: 256 * 2 ** logN * r + 1024 * 1024 });

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await derive(password, salt, optionsFor(LOG_N, R, P));
    return ['scrypt', LOG_N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const [scheme, logN, r, p, salt, key, ...rest] = hash.split('$');
    const params = [logN, r, p].map(Number);
    if (scheme !== 'scrypt' || rest.length > 0 || !salt || !key || !params.every((n) => Number.isInteger(n) && n > 0 && n < 32)) return false;
    const expected = Buffer.from(key, 'base64');
    if (expected.length !== KEY_LENGTH) return false;
    const actual = await derive(password, Buffer.from(salt, 'base64'), optionsFor(params[0], params[1], params[2]));
    return timingSafeEqual(actual, expected);
  }
}
