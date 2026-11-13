import { User } from './user.js';

const now = new Date('2026-11-13T08:00:00Z');
const minutes = (n: number) => new Date(now.getTime() + n * 60_000);

const teacher = () =>
  User.create({ id: 'u1', email: '  Co.Linh@Example.EDU.vn ', passwordHash: 'h', fullName: ' Nguyễn Hà Linh ', phone: '', role: 'TEACHER' });

describe('User', () => {
  it('normalizes email and trims the name on creation', () => {
    const user = teacher();
    expect(user.email).toBe('co.linh@example.edu.vn');
    expect(user.fullName).toBe('Nguyễn Hà Linh');
    expect(user.isActive).toBe(true);
  });

  it('locks for 15 minutes on the fifth consecutive failure', () => {
    const user = teacher();
    for (let i = 0; i < 4; i++) user.registerFailedLogin(now);
    expect(() => user.assertCanLogIn(now)).not.toThrow();
    user.registerFailedLogin(now);
    expect(() => user.assertCanLogIn(minutes(14))).toThrow(expect.objectContaining({ code: 'ACCOUNT_LOCKED', status: 423 }));
    expect(() => user.assertCanLogIn(minutes(15))).not.toThrow();
  });

  it('tells how many minutes remain, rounded up', () => {
    const user = teacher();
    for (let i = 0; i < 5; i++) user.registerFailedLogin(now);
    expect(() => user.assertCanLogIn(minutes(13.5))).toThrow('2 phút');
  });

  it('resets the failure counter after a successful login', () => {
    const user = teacher();
    for (let i = 0; i < 4; i++) user.registerFailedLogin(now);
    user.registerSuccessfulLogin();
    for (let i = 0; i < 4; i++) user.registerFailedLogin(now);
    expect(() => user.assertCanLogIn(now)).not.toThrow();
  });

  it('rejects login when disabled', () => {
    const user = teacher();
    user.setActive(false);
    expect(() => user.assertCanLogIn(now)).toThrow(expect.objectContaining({ code: 'ACCOUNT_DISABLED', status: 403 }));
  });

  it('unlocks when the password is reset', () => {
    const user = teacher();
    for (let i = 0; i < 5; i++) user.registerFailedLogin(now);
    user.changePassword('new-hash');
    expect(user.passwordHash).toBe('new-hash');
    expect(() => user.assertCanLogIn(now)).not.toThrow();
  });
});
