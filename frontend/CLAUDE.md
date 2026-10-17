@AGENTS.md

# CLAUDE.md

Frontend for a special-education center: a public landing page and a staff portal for managing classes, students, and monthly skill evaluations. The UI is in Vietnamese. More detail lives in [docs/](docs/README.md).

## Commands

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # the only automated check right now; run it after changes
pnpm start
```

The project has no lint or test scripts yet. Run Docker from the repo root (`..`) with `docker compose up --build`. CI/CD lives in `../.github/workflows/deploy.yml`.

## Architecture

- **Next.js 16 App Router + React 19.** Read `node_modules/next/dist/docs/` before using any Next API (see AGENTS.md).
- Routes:
  - `src/app/page.tsx`: the landing page. A server component styled with `globals.css`.
  - `src/app/login/page.tsx`: a **mock** login. Any submit redirects to `/portal`, and no auth happens.
  - `src/app/portal/`: one client page (`portal.tsx`) with three tabs: `classes`, `students`, `reports`. It reads the deep links `?tab=` and `?student=<id>` once, on mount.
- State: all portal state lives in `useSchoolManagement` (`src/features/school/use-school-management.ts`), seeded from the mock data in `src/features/school/data.ts`. The app has **no backend and no persistence**, so a reload resets everything.
- Folders:
  - `src/components/ui/`: thin Radix UI wrappers (dialog, select, dropdown, popover, date and month pickers, and so on).
  - `src/components/school/`: domain views (app shell, class overview, student list and profile, report, entity modal).
  - `src/features/school/`: types, mock data, evaluation criteria, and the state hook.
  - `src/config/site.ts`: center identity (name, short name, logo initial, email domain).

## Domain rules (enforced in code)

- Evaluations are keyed by `` `${studentId}-${month}` `` (month is `YYYY-MM`) and hold one `Rating` per criterion index from `criteria` in `data.ts`.
- Evaluation status moves `draft → updated → locked`. When it is `locked`, `updateRating` refuses edits.
- A class that still has students cannot be deleted. The portal shows a notice instead.

## Conventions

- **Never hard-code the center name, short name, logo initial, or email domain.** Import `siteConfig` from `@/config/site`. Its values come from the `NEXT_PUBLIC_CENTER_*` variables in `.env` (see `.env.example`). The name is a placeholder ("ABC") and will be replaced later.
- `NEXT_PUBLIC_*` values are inlined at build time. Always write `process.env.NEXT_PUBLIC_X` literally and never look the name up dynamically.
- Write components as arrow functions. Components use named exports. `app/` pages and layouts use default exports.
- Use `"use client"` only where hooks or browser APIs are needed.
- Styling:
  - The portal and `components/` use Tailwind v4 (`src/app/tailwind.css`, imported with `important`). Theme tokens are `brand-*`, `coral-*`, `surface`, and `shadow-card`.
  - The landing page uses `globals.css` (minified, CSS variables) and the login page uses `login.module.css`.
- Import with the `@/` alias for `src/`.
- Match the existing dense, mostly single-line JSX style. All user-facing copy is Vietnamese.
