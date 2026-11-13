import { cannotChangeSelf, lastManager } from './auth-errors.js';
import type { Role, User } from './user.js';

export const assertManagerChangeAllowed = (input: {
  actorId: string;
  target: User;
  next: { role?: Role; isActive?: boolean };
  activeManagerCount: number;
}) => {
  const { actorId, target, next, activeManagerCount } = input;
  const wasActiveManager = target.role === 'MANAGER' && target.isActive;
  const staysActiveManager = (next.role ?? target.role) === 'MANAGER' && (next.isActive ?? target.isActive);
  if (!wasActiveManager || staysActiveManager) return;
  if (target.id === actorId) throw cannotChangeSelf();
  if (activeManagerCount <= 1) throw lastManager();
};
