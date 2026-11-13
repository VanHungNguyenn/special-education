import type { Clock, PasswordHasher, SessionRepository, UserRepository } from '../../src/modules/auth/domain/ports.js';
import { Session } from '../../src/modules/auth/domain/session.js';
import { User, type NewUser } from '../../src/modules/auth/domain/user.js';

export class FakeClock implements Clock {
  constructor(private current = new Date('2026-11-13T08:00:00Z')) {}
  now() {
    return new Date(this.current);
  }
  advanceMinutes(minutes: number) {
    this.current = new Date(this.current.getTime() + minutes * 60_000);
  }
}

export class FakeHasher implements PasswordHasher {
  async hash(password: string) {
    return `fake:${password}`;
  }
  async verify(password: string, hash: string) {
    return hash === `fake:${password}`;
  }
}

export class InMemoryUserRepository implements UserRepository {
  readonly users = new Map<string, User>();
  async findById(id: string) {
    const user = this.users.get(id);
    return user ? User.restore(user.toProps()) : null;
  }
  async findByEmail(email: string) {
    const user = [...this.users.values()].find((candidate) => candidate.email === email);
    return user ? User.restore(user.toProps()) : null;
  }
  async list() {
    return [...this.users.values()].map((user) => User.restore(user.toProps()));
  }
  async countActiveManagers() {
    return [...this.users.values()].filter((user) => user.role === 'MANAGER' && user.isActive).length;
  }
  async save(user: User) {
    this.users.set(user.id, User.restore(user.toProps()));
  }
  async add(input: Omit<NewUser, 'passwordHash'> & { password: string }) {
    const { password, ...rest } = input;
    const user = User.create({ ...rest, passwordHash: `fake:${password}` });
    await this.save(user);
    return user;
  }
}

export class InMemorySessionRepository implements SessionRepository {
  readonly sessions = new Map<string, Session>();
  async findByTokenHash(tokenHash: string) {
    const session = [...this.sessions.values()].find((candidate) => candidate.toProps().tokenHash === tokenHash);
    return session ? Session.restore(session.toProps()) : null;
  }
  async save(session: Session) {
    this.sessions.set(session.id, Session.restore(session.toProps()));
  }
  async delete(id: string) {
    this.sessions.delete(id);
  }
  async deleteAllForUser(userId: string, exceptSessionId?: string) {
    for (const [id, session] of this.sessions) if (session.userId === userId && id !== exceptSessionId) this.sessions.delete(id);
  }
  async deleteExpired(now: Date) {
    let count = 0;
    for (const [id, session] of this.sessions) if (session.isExpired(now) && this.sessions.delete(id)) count++;
    return count;
  }
}
