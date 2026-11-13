import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';

export const createTestApp = async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = configureApp(moduleRef.createNestApplication({ logger: false }));
  return app.init();
};
