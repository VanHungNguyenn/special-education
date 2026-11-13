import { execFileSync } from 'node:child_process';
import { loadTestEnv } from './utils/test-env.js';

export default function setup() {
  loadTestEnv();
  execFileSync('node_modules/.bin/prisma', ['migrate', 'deploy'], { stdio: 'inherit', env: process.env });
}
