import { Injectable } from '@nestjs/common';
import type { User as UserRecord } from '../../../generated/prisma/client.js';
import { PrismaService } from '../../../prisma/prisma.service.js';
import type { UserRepository } from '../domain/ports.js';
import { User } from '../domain/user.js';

const toDomain = (record: UserRecord) =>
  User.restore({
    id: record.id,
    email: record.email,
    passwordHash: record.passwordHash,
    fullName: record.fullName,
    phone: record.phone,
    role: record.role,
    isActive: record.isActive,
    failedLoginCount: record.failedLoginCount,
    lockedUntil: record.lockedUntil,
  });

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? toDomain(record) : null;
  }

  async findByEmail(email: string) {
    const record = await this.prisma.user.findUnique({ where: { email } });
    return record ? toDomain(record) : null;
  }

  async list() {
    const records = await this.prisma.user.findMany({ orderBy: [{ fullName: 'asc' }, { email: 'asc' }] });
    return records.map(toDomain);
  }

  countActiveManagers() {
    return this.prisma.user.count({ where: { role: 'MANAGER', isActive: true } });
  }

  async save(user: User) {
    const { id, ...data } = user.toProps();
    await this.prisma.user.upsert({ where: { id }, create: { id, ...data }, update: data });
  }
}
