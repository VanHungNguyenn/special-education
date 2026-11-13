import { FakeClock, FakeHasher, InMemorySessionRepository, InMemoryUserRepository } from '../../../../test/fakes/auth-fakes.js';
import { LoginUseCase } from './login.use-case.js';

const setup = async () => {
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const clock = new FakeClock();
  const login = new LoginUseCase(users, sessions, new FakeHasher(), clock);
  await users.add({ id: 'u1', email: 'gv@test.local', password: 'dung-mat-khau', fullName: 'GV', phone: '', role: 'TEACHER' });
  return { users, sessions, clock, login };
};

const attempt = (login: LoginUseCase, password: string) => login.execute({ email: 'gv@test.local', password, remember: false });

describe('LoginUseCase', () => {
  it('locks after five wrong passwords even for the right one, and unlocks after 15 minutes', async () => {
    const { clock, login } = await setup();
    for (let i = 0; i < 5; i++) await expect(attempt(login, 'sai')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    await expect(attempt(login, 'dung-mat-khau')).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED', message: expect.stringContaining('15 phút') });
    clock.advanceMinutes(14);
    await expect(attempt(login, 'dung-mat-khau')).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED', message: expect.stringContaining('1 phút') });
    clock.advanceMinutes(1);
    await expect(attempt(login, 'dung-mat-khau')).resolves.toMatchObject({ user: { id: 'u1' } });
  });

  it('only reveals a disabled account to someone with the right password', async () => {
    const { users, login } = await setup();
    const user = (await users.findById('u1'))!;
    user.setActive(false);
    await users.save(user);
    await expect(attempt(login, 'sai')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    await expect(attempt(login, 'dung-mat-khau')).rejects.toMatchObject({ code: 'ACCOUNT_DISABLED' });
  });

  it('cleans up expired sessions on login', async () => {
    const { sessions, clock, login } = await setup();
    await attempt(login, 'dung-mat-khau');
    clock.advanceMinutes(13 * 60);
    await attempt(login, 'dung-mat-khau');
    expect(sessions.sessions.size).toBe(1);
  });
});
