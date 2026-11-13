import { FakeHasher, InMemoryUserRepository } from '../../../../test/fakes/auth-fakes.js';
import { CreateUserUseCase } from './create-user.use-case.js';

describe('CreateUserUseCase', () => {
  const input = { email: 'Moi@Test.Local', fullName: 'Mới', phone: '', role: 'TEACHER' as const, password: 'mat-khau-goc-1' };

  it('stores only the password hash on the user', async () => {
    const users = new InMemoryUserRepository();
    const user = await new CreateUserUseCase(users, new FakeHasher()).execute(input);
    expect(Object.keys(user.toProps()).sort()).toEqual(
      ['email', 'failedLoginCount', 'fullName', 'id', 'isActive', 'lockedUntil', 'passwordHash', 'phone', 'role'].sort(),
    );
    expect(user.passwordHash).toBe('fake:mat-khau-goc-1');
    expect(user.email).toBe('moi@test.local');
  });

  it('rejects a weak password before hashing', async () => {
    await expect(new CreateUserUseCase(new InMemoryUserRepository(), new FakeHasher()).execute({ ...input, password: 'ngan' })).rejects.toMatchObject({
      code: 'WEAK_PASSWORD',
    });
  });
});
