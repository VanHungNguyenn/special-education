import { assertValidPassword } from './password-policy.js';

describe('assertValidPassword', () => {
  it.each(['1234567', 'x'.repeat(129)])('rejects %#', (password) => {
    expect(() => assertValidPassword(password)).toThrow(expect.objectContaining({ code: 'WEAK_PASSWORD', status: 400 }));
  });

  it.each(['12345678', 'x'.repeat(128)])('accepts %#', (password) => {
    expect(() => assertValidPassword(password)).not.toThrow();
  });
});
