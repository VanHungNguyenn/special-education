import { validateEnv } from './env.validation.js';

const valid = {
  NODE_ENV: 'production',
  PORT: '4100',
  DATABASE_URL: 'postgresql://u:p@db:5432/app',
  DIRECT_URL: 'postgresql://u:p@db:5432/app',
};

const without = (key: keyof typeof valid) => {
  const { [key]: _removed, ...rest } = valid;
  return rest;
};

describe('validateEnv', () => {
  it('returns typed values', () => {
    expect(validateEnv(valid)).toMatchObject({ NODE_ENV: 'production', PORT: 4100 });
  });

  it('applies defaults for NODE_ENV and PORT', () => {
    expect(validateEnv(without('PORT'))).toMatchObject({ PORT: 4000 });
    expect(validateEnv(without('NODE_ENV'))).toMatchObject({ NODE_ENV: 'development' });
  });

  it.each(['DATABASE_URL', 'DIRECT_URL'] as const)('rejects missing %s', (key) => {
    expect(() => validateEnv(without(key))).toThrow(key);
  });

  it('rejects a non-postgres database url', () => {
    expect(() => validateEnv({ ...valid, DIRECT_URL: 'mysql://u:p@db/app' })).toThrow('DIRECT_URL');
  });

  it('rejects an unknown NODE_ENV', () => {
    expect(() => validateEnv({ ...valid, NODE_ENV: 'staging' })).toThrow('NODE_ENV');
  });

  it('rejects a non-numeric PORT', () => {
    expect(() => validateEnv({ ...valid, PORT: 'abc' })).toThrow('PORT');
  });

  it.each([
    ['false', false],
    ['TRUE', true],
    ['', undefined],
  ])('reads COOKIE_SECURE=%j as %j', (value, expected) => {
    expect(validateEnv({ ...valid, COOKIE_SECURE: value }).COOKIE_SECURE).toBe(expected);
  });

  it('lists every invalid variable at once', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL[\s\S]*DIRECT_URL/);
  });
});
