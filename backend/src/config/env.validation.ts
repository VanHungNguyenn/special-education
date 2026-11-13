import { plainToInstance } from 'class-transformer';
import { IsIn, IsInt, Matches, Max, Min, validateSync } from 'class-validator';

const POSTGRES_URL = /^postgres(ql)?:\/\/.+/;

export class Env {
  @IsIn(['development', 'production', 'test'])
  NODE_ENV: 'development' | 'production' | 'test' = 'development';

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @Matches(POSTGRES_URL, { message: 'must be a postgresql:// connection string' })
  DATABASE_URL: string;

  @Matches(POSTGRES_URL, { message: 'must be a postgresql:// connection string' })
  DIRECT_URL: string;
}

export const validateEnv = (config: Record<string, unknown>): Env => {
  const env = plainToInstance(Env, config, { enableImplicitConversion: true });
  const errors = validateSync(env);
  if (errors.length > 0) {
    const details = errors.map((error) => `  - ${error.property}: ${Object.values(error.constraints ?? {}).join('; ')}`);
    throw new Error(`Invalid environment variables:\n${details.join('\n')}`);
  }
  return env;
};
