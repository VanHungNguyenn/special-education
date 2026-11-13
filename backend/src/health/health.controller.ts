import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../modules/auth/index.js';
import { PrismaService } from '../prisma/prisma.service.js';

const DB_TIMEOUT_MS = 2000;

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(@Res({ passthrough: true }) response: Response) {
    if (await this.isDatabaseUp()) return { status: 'ok', db: 'ok' };
    response.status(503);
    return { status: 'error', db: 'down' };
  }

  private async isDatabaseUp() {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<false>((resolve) => {
      timer = setTimeout(() => resolve(false), DB_TIMEOUT_MS);
    });
    const ping = this.prisma.$queryRaw`SELECT 1`.then(() => true, () => false);
    try {
      return await Promise.race([ping, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
