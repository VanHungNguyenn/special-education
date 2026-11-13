import type { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './common/errors/http-exception.filter.js';
import { createValidationPipe } from './common/http/validation.pipe.js';

export const configureApp = (app: INestApplication) => {
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(createValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  return app;
};
