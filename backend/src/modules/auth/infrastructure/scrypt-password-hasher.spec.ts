import { ScryptPasswordHasher } from './scrypt-password-hasher.js';

describe('ScryptPasswordHasher', () => {
  const hasher = new ScryptPasswordHasher();

  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hasher.hash('mật khẩu đúng');
    expect(hash).toMatch(/^scrypt\$17\$8\$1\$[\w+/=]+\$[\w+/=]+$/);
    await expect(hasher.verify('mật khẩu đúng', hash)).resolves.toBe(true);
    await expect(hasher.verify('mật khẩu sai', hash)).resolves.toBe(false);
  });

  it('salts every hash', async () => {
    expect(await hasher.hash('same')).not.toBe(await hasher.hash('same'));
  });

  it.each(['', 'plain', 'bcrypt$10$abc', 'scrypt$17$8$1$onlysalt', 'scrypt$x$8$1$a$b'])('returns false for malformed hash %j', async (hash) => {
    await expect(hasher.verify('anything', hash)).resolves.toBe(false);
  });
});
