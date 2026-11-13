import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { SessionRepository } from '../domain/ports.js';
import { Session } from '../domain/session.js';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTokenHash(tokenHash: string) {
    const record = await this.prisma.session.findUnique({ where: { tokenHash } });
    return record
      ? Session.restore({
          id: record.id,
          tokenHash: record.tokenHash,
          userId: record.userId,
          remember: record.remember,
          expiresAt: record.expiresAt,
          lastUsedAt: record.lastUsedAt,
        })
      : null;
  }

  async save(session: Session) {
    const { id, ...data } = session.toProps();
    await this.prisma.session.upsert({ where: { id }, create: { id, ...data }, update: data });
  }

  async delete(id: string) {
    await this.prisma.session.deleteMany({ where: { id } });
  }

  async deleteAllForUser(userId: string, exceptSessionId?: string) {
    await this.prisma.session.deleteMany({ where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) } });
  }

  async deleteExpired(now: Date) {
    const { count } = await this.prisma.session.deleteMany({ where: { expiresAt: { lte: now } } });
    return count;
  }
}
