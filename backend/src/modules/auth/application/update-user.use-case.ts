import { Inject, Injectable } from '@nestjs/common';
import { emailTaken, userNotFound } from '../domain/auth-errors.js';
import { assertManagerChangeAllowed } from '../domain/manager-rules.js';
import { SESSION_REPOSITORY, USER_REPOSITORY, type SessionRepository, type UserRepository } from '../domain/ports.js';
import { normalizeEmail, type Role, type User } from '../domain/user.js';

export type UserChanges = { email?: string; fullName?: string; phone?: string; role?: Role; isActive?: boolean };

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
  ) {}

  async execute(input: { actor: User; id: string; changes: UserChanges }): Promise<User> {
    const { actor, id, changes } = input;
    const target = await this.users.findById(id);
    if (!target) throw userNotFound();
    if (changes.role !== undefined || changes.isActive !== undefined) {
      assertManagerChangeAllowed({
        actorId: actor.id,
        target,
        next: { role: changes.role, isActive: changes.isActive },
        activeManagerCount: await this.users.countActiveManagers(),
      });
    }
    if (changes.email !== undefined) {
      const owner = await this.users.findByEmail(normalizeEmail(changes.email));
      if (owner && owner.id !== target.id) throw emailTaken();
    }
    const wasActive = target.isActive;
    target.updateProfile(changes);
    if (changes.role !== undefined) target.setRole(changes.role);
    if (changes.isActive !== undefined) target.setActive(changes.isActive);
    await this.users.save(target);
    if (wasActive && !target.isActive) await this.sessions.deleteAllForUser(target.id);
    return target;
  }
}
