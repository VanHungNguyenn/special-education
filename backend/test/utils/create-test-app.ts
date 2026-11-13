import { Test, type TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';

export const createTestApp = async (customize: (builder: TestingModuleBuilder) => TestingModuleBuilder = (builder) => builder) => {
  const moduleRef = await customize(Test.createTestingModule({ imports: [AppModule] })).compile();
  const app = configureApp(moduleRef.createNestApplication({ logger: false }));
  return app.init();
};
