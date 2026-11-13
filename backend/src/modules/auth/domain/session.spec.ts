import { Session } from './session.js';

const now = new Date('2026-11-13T08:00:00Z');
const hours = (n: number) => new Date(now.getTime() + n * 3_600_000);
const start = (remember: boolean) => Session.start({ id: 's1', tokenHash: 't', userId: 'u1', remember, now });

describe('Session', () => {
  it('lasts 12 hours without remember and never renews', () => {
    const session = start(false);
    expect(session.expiresAt).toEqual(hours(12));
    expect(session.renew(hours(5))).toBe(false);
    expect(session.isExpired(hours(11.9))).toBe(false);
    expect(session.isExpired(hours(12))).toBe(true);
  });

  it('lasts 30 days with remember', () => {
    expect(start(true).expiresAt).toEqual(hours(24 * 30));
  });

  it('renews a remembered session at most once per hour', () => {
    const session = start(true);
    expect(session.renew(hours(0.5))).toBe(false);
    expect(session.renew(hours(2))).toBe(true);
    expect(session.expiresAt).toEqual(hours(2 + 24 * 30));
    expect(session.renew(hours(2.5))).toBe(false);
  });
});
