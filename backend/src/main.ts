import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({ json: process.env.NODE_ENV === 'production' }),
  });
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
  await app.listen(app.get(ConfigService<Env, true>).get('PORT', { infer: true }));
}
await bootstrap();
