import { existsSync } from 'node:fs';

export const loadTestEnv = () => {
  process.loadEnvFile(existsSync('.env.test') ? '.env.test' : '.env.test.example');
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
    const name = new URL(process.env[key] ?? 'postgresql://invalid/').pathname.slice(1);
    if (!name.endsWith('_test')) {
      throw new Error(`${key} must point to a database whose name ends with "_test" (got "${name}"). e2e tests wipe data.`);
    }
  }
};
