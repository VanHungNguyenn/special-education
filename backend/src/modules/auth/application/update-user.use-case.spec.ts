import { FakeClock, InMemorySessionRepository, InMemoryUserRepository } from '../../../../test/fakes/auth-fakes.js';
import { Session } from '../domain/session.js';
import { UpdateUserUseCase } from './update-user.use-case.js';

const setup = async () => {
  const users = new InMemoryUserRepository();
  const sessions = new InMemorySessionRepository();
  const actor = await users.add({ id: 'm1', email: 'm1@x.vn', password: 'p', fullName: 'QL', phone: '', role: 'MANAGER' });
  await users.add({ id: 't1', email: 't1@x.vn', password: 'p', fullName: 'GV', phone: '', role: 'TEACHER' });
  await sessions.save(Session.start({ id: 's1', tokenHash: 'h1', userId: 't1', remember: false, now: new FakeClock().now() }));
  return { users, sessions, actor, update: new UpdateUserUseCase(users, sessions) };
};

describe('UpdateUserUseCase', () => {
  it('ends sessions only when a user goes from active to disabled', async () => {
    const { sessions, actor, update } = await setup();
    await update.execute({ actor, id: 't1', changes: { fullName: 'Tên mới' } });
    expect(sessions.sessions.size).toBe(1);
    await update.execute({ actor, id: 't1', changes: { isActive: false } });
    expect(sessions.sessions.size).toBe(0);
  });

  it('allows keeping the same email', async () => {
    const { actor, update } = await setup();
    await expect(update.execute({ actor, id: 't1', changes: { email: 'T1@x.vn' } })).resolves.toMatchObject({ email: 't1@x.vn' });
  });

  it('rejects an email owned by another user', async () => {
    const { actor, update } = await setup();
    await expect(update.execute({ actor, id: 't1', changes: { email: 'm1@x.vn' } })).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });
  });
});
