# CLAUDE.md

Monorepo for a special-education center (Vietnamese UI): a public landing page plus a staff portal where teachers manage classes, students, and monthly skill evaluations, and export reports in the center's GDCN template (`Mau_GDCN.pdf`).

## Status

| Part | State |
|---|---|
| `frontend/` | Done enough to demo. Next.js 16, **mock data only, no persistence, mock login**. Has its own [CLAUDE.md](frontend/CLAUDE.md) and [docs/](frontend/docs/README.md). |
| `backend/` | Not started (branch `feat/backend-starter`). Architecture: [docs/architecture.md](docs/architecture.md). Specs: [SPEC-backend.md](SPEC-backend.md) (module map) → `SPEC-<module>.md`. FE needs: [docs/backend-requirements.md](docs/backend-requirements.md). |

## Layout

```
special-education/
├── CLAUDE.md                 # this file: repo-wide overview
├── README.md                 # human entry point (Vietnamese)
├── RUNNING.md                # how to run (local + Docker)
├── SPEC.md                   # draft spec: report tab redesign (FE) + report-download API (BE)
├── Mau_GDCN.pdf              # the center's paper evaluation form; the backend renders reports in this layout
├── docs/backend-requirements.md  # FE → BE contract: entities, operations, rules, open questions
├── frontend/                 # Next.js app (see frontend/CLAUDE.md before touching it)
├── docker-compose.yml        # prod: one service `frontend` on :3000, image from GHCR
├── docker-compose.dev.yml    # dev: mounts ./frontend, runs pnpm dev
├── docker.sh                 # ./docker.sh [up|dev|down|restart|logs|status]
└── .github/workflows/deploy.yml  # push to master touching frontend/** → build image → SSH deploy
```

## Commands

```bash
cd frontend && pnpm install && pnpm dev   # http://localhost:3000
cd frontend && pnpm build && pnpm test    # type-check + unit tests
./docker.sh                               # prod-like container
./docker.sh dev                           # dev container with hot reload
```

UI checks (`pnpm a11y-check`, `pnpm layout-check`, `pnpm screenshot`) need a running server; see [frontend/docs/testing.md](frontend/docs/testing.md).

## Where the backend plugs in

- All portal state and every mutation live in one hook: `frontend/src/features/school/use-school-management.ts`. Replacing its `useState` calls with API calls is the integration point; components receive data via props and don't need to change.
- Types to mirror: `frontend/src/features/school/types.ts`. Criteria list and labels: `frontend/src/features/school/data.ts`.
- Login is fake: `frontend/src/app/login/page.tsx` just redirects to `/portal`. The account menu (`components/school/account-menu.tsx`) shows a hard-coded user.
- Report export is `window.print()` today; SPEC.md plans to replace it with a backend download URL.

## Repo-wide rules

- All user-facing text is Vietnamese.
- Never hard-code the center's name/short name/initial/email domain. FE reads them from `NEXT_PUBLIC_CENTER_*` via `siteConfig`; the backend should take them from config/env too (the sample PDF says "Tâm Anh"; do not copy that).
- Evaluation status flow is `draft → updated → locked`; a locked evaluation can't be edited. A class with students can't be deleted. Enforce both server-side once the backend exists.
- Criteria are referenced by **array index** in `data.ts`. Reordering them corrupts stored ratings; the backend should use stable criterion IDs.
- No code comments unless asked (user preference).
- When adding the backend to Docker/CI: add a service to both compose files, extend `docker.sh`, and widen the `paths` filter in `deploy.yml` (it only watches `frontend/**` now).
