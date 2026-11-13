# CLAUDE.md (backend)

NestJS 12 API for the special-education portal. Architecture and patterns: [../docs/architecture.md](../docs/architecture.md). Module map and shared rules: [../SPEC-backend.md](../SPEC-backend.md). Current module plan: [../tasks/auth/plan.md](../tasks/auth/plan.md).

## Commands

```bash
cp .env.example .env
pnpm install                                            # also runs prisma generate
docker compose -f ../docker-compose.dev.yml up -d db    # Postgres on 127.0.0.1:5432 (+ special_education_test)
pnpm db:deploy                                          # apply migrations
pnpm start:dev                                          # http://localhost:4000/api/v1/health, docs at /api/v1/docs
pnpm lint                                               # oxlint -c oxlint.json (plain `oxlint` ignores the config)
pnpm test                                               # unit (Vitest), no DB
pnpm test:e2e                                           # e2e against special_education_test; refuses DB names without _test
pnpm build                                              # prisma generate + nest build
pnpm db:migrate                                         # create a migration in dev
pnpm db:seed / pnpm db:seed:demo / pnpm db:reset
```

Before reporting a task done: `pnpm lint && pnpm test && pnpm test:e2e && pnpm build`.

## Stack facts that differ from older Nest/Prisma

- **ESM.** `"type": "module"`, TypeScript 6, `nodenext`. Relative imports end in `.js` (`import { X } from './x.js'`).
- **Vitest, not Jest; oxlint, not ESLint** (Nest 12 defaults). `vi.fn()`, `vi.spyOn()`.
- **Prisma 7.10.1** with `@prisma/adapter-pg`. Client is generated into `src/generated/prisma` (gitignored). The CLI reads `prisma.config.ts`: migrations use `DIRECT_URL`, the app uses `DATABASE_URL`. Do not upgrade to the `latest` npm tag (it is an 8.0 RC).
- **pnpm 12** blocks install scripts: new packages that need one go in `allowBuilds` in `pnpm-workspace.yaml`.

## Layers (enforced by `oxlint.json`)

Each feature is `src/modules/<name>/` with four folders. Copy `src/modules/_template/` to start a module.

| Folder | Contains | May import |
|---|---|---|
| `domain/` | Entities with business rules, repository interfaces + `Symbol` tokens, `DomainError`s | Only TypeScript and `common/errors`. No `@nestjs/*`, `@prisma/*`, `express`, `class-validator` |
| `application/` | One use case class per operation, `execute()` only | `domain/`, `@nestjs/common` for `@Injectable`/`@Inject` |
| `infrastructure/` | Prisma repositories + mappers, external adapters | `domain/`, Prisma |
| `http/` | Controllers, request/response DTOs | `application/`, `domain/` types |

- Controllers validate (DTO), call one use case, map with `XResponse.from()`. No business logic, no Prisma.
- Never return Prisma records from the API.
- Other modules use only what a module `exports`.
- Prisma may be imported only in `src/prisma/` and `**/infrastructure/**`.

## Errors and validation

- Throw `new DomainError(code, vietnameseMessage, status, details?)` from `common/errors/domain-error.ts`. The global filter turns every error into `{ error: { code, message, details } }`. Unexpected errors become `500 INTERNAL_ERROR` and are only logged.
- DTO messages are Vietnamese. Validation stops at the first failing rule per field, and class-validator runs decorators bottom-up, so **put the type check (`@IsString()` …) last, directly above the property**.
- Unknown body properties are rejected.

## Conventions

- No code comments unless asked.
- Config only through `ConfigService<Env, true>` (`get('X', { infer: true })`); add new variables to `config/env.validation.ts` and both `.env*.example` files.
- e2e apps come from `test/utils/create-test-app.ts` (same `configureApp()` as `main.ts`); call `resetDb(app)` when a test writes data.
- Port 4000 is the default; on the current dev machine another app holds it, so use `PORT=4100` (or `BACKEND_PORT=4100 ./docker.sh dev`).
