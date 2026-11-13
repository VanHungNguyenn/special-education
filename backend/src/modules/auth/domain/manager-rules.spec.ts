import { assertManagerChangeAllowed } from './manager-rules.js';
import { User } from './user.js';

const manager = (id: string) => User.create({ id, email: `${id}@x.vn`, passwordHash: 'h', fullName: id, phone: '', role: 'MANAGER' });

describe('assertManagerChangeAllowed', () => {
  it('forbids disabling or demoting the last active manager', () => {
    const target = manager('m1');
    expect(() => assertManagerChangeAllowed({ actorId: 'm0', target, next: { isActive: false }, activeManagerCount: 1 })).toThrow(
      expect.objectContaining({ code: 'LAST_MANAGER' }),
    );
    expect(() => assertManagerChangeAllowed({ actorId: 'm0', target, next: { role: 'TEACHER' }, activeManagerCount: 1 })).toThrow(
      expect.objectContaining({ code: 'LAST_MANAGER' }),
    );
  });

  it('allows it when another active manager remains', () => {
    expect(() => assertManagerChangeAllowed({ actorId: 'm0', target: manager('m1'), next: { isActive: false }, activeManagerCount: 2 })).not.toThrow();
  });

  it('forbids a manager from disabling or demoting themself', () => {
    const self = manager('m1');
    expect(() => assertManagerChangeAllowed({ actorId: 'm1', target: self, next: { isActive: false }, activeManagerCount: 3 })).toThrow(
      expect.objectContaining({ code: 'CANNOT_CHANGE_SELF' }),
    );
    expect(() => assertManagerChangeAllowed({ actorId: 'm1', target: self, next: { role: 'TEACHER' }, activeManagerCount: 3 })).toThrow(
      expect.objectContaining({ code: 'CANNOT_CHANGE_SELF' }),
    );
  });

  it('ignores changes that keep a manager active', () => {
    expect(() => assertManagerChangeAllowed({ actorId: 'm1', target: manager('m1'), next: { role: 'MANAGER', isActive: true }, activeManagerCount: 1 })).not.toThrow();
  });
});
