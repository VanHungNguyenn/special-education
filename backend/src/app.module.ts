import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { HealthModule } from './health/health.module.js';
import { AuthModule } from './modules/auth/index.js';
import { TemplateModule } from './modules/_template/template.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    PrismaModule,
    HealthModule,
    AuthModule,
    ConditionalModule.registerWhen(TemplateModule, (env) => env.NODE_ENV === 'test'),
  ],
})
export class AppModule {}
