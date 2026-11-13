import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/errors/http-exception.filter.js';
import { createValidationPipe } from './common/http/validation.pipe.js';
import type { Env } from './config/env.validation.js';

export const configureApp = (app: INestApplication) => {
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  if (app.get(ConfigService<Env, true>).get('NODE_ENV', { infer: true }) !== 'production') {
    const document = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Special Education API').setVersion('1').build());
    SwaggerModule.setup('api/v1/docs', app, document, { jsonDocumentUrl: 'api/v1/docs-json' });
  }
  return app;
};
