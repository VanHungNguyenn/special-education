@AGENTS.md

# CLAUDE.md

Frontend for a special-education center: a public landing page and a staff portal for managing classes, students, and monthly skill evaluations. The UI is in Vietnamese. More detail lives in [docs/](docs/README.md).

## Commands

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # type-check + build; run it after changes
pnpm start
pnpm screenshot   # Playwright screenshots of /, /login, /portal at 375/768/1440 (needs a running server)
pnpm layout-check # overlap / tight-gap / overflow check of / and /login at 19 widths (needs a running server)
pnpm a11y-check   # touch targets, contrast, text size, labels, keyboard on all pages at 375/768/1024/1440 (needs a running server)
pnpm test         # unit tests (node:test) for pure helpers (src/lib, features/*/redirect|account)
pnpm auth-flow    # browser check: redirect → login → reload → logout (needs a running server)
```

The check scripts log in through `scripts/login.mjs` as `quanly@demo.local` / `demo2026` (override with `CHECK_EMAIL` / `CHECK_PASSWORD`), so the backend must be running with demo data: `cd ../backend && pnpm db:seed:demo`. Five wrong passwords lock an account for 15 minutes; a manager unlocks it by resetting the password.

There is no lint yet. Unit tests import `.ts` files directly with Node's type stripping, so keep tested files free of enums, parameter properties and `@/` imports. After UI changes, run `pnpm a11y-check` and `pnpm screenshot` and look at the PNGs in `screenshots/`; see [docs/testing.md](docs/testing.md). Run Docker from the repo root (`..`) with `docker compose up --build`. CI/CD lives in `../.github/workflows/deploy.yml`.

## Architecture

- **Next.js 16 App Router + React 19.** Read `node_modules/next/dist/docs/` before using any Next API (see AGENTS.md).
- Routes:
  - `src/app/page.tsx`: the landing page. A server component styled with `globals.css`.
  - `src/app/login/page.tsx`: real login (`useLogin`), returns to a validated `?next=` path (`features/auth/redirect.ts`).
  - `src/proxy.ts`: Next 16 proxy (ex-middleware). Requests to `/portal` without the `sid` cookie go to `/login?next=…`; the backend still decides if the session is valid.
  - `src/app/portal/`: one client page (`page.tsx`) with tabs `classes`, `students`, `reports` and, for managers only, `accounts`. It reads the deep links `?tab=` and `?student=<id>` once, on mount.
- Server state: TanStack Query (`../docs/architecture.md` §3). `lib/api/http-client.ts` (`request`, `ApiError`, `errorText`) → `features/<name>/api.ts` → `queries.ts` (hooks, `query-keys.ts`) → components. `lib/api/query-provider.tsx` sends `UNAUTHENTICATED` to `/login`. Done for `features/auth` (`useMe`, `useLogin`, `useLogout`, `useChangePassword`) and `features/users`.
- Mock state: classes, students and evaluations still live in `useSchoolManagement` (`src/features/school/`), seeded from `data.ts`; a reload resets them. They move to TanStack Query with the `roster` and `evaluations` modules.
- `/api/*` is rewritten to `BACKEND_URL` (`next.config.ts`, baked in at build time).
- Folders:
  - `src/components/ui/`: **shadcn/ui components only** (new-york style on Radix, configured in `components.json`).
  - `src/components/common/`: compositions of shadcn primitives (`DatePicker`, `MonthPicker`, `Field`/`TextareaField`/`SelectField`).
  - `src/components/landing/`: client components for the landing page (`MobileNav`).
  - `src/components/school/`: domain views (app shell, class overview, student list and profile, report, entity modal).
  - `src/features/school/`: types, mock data, evaluation criteria, and the state hook.
  - `src/config/site.ts`: center identity (name, short name, logo initial, email domain).
  - `src/lib/utils.ts`: `cn()` (clsx + tailwind-merge). Icons come from `lucide-react`.

## Domain rules (enforced in code)

- Evaluations are keyed by `` `${studentId}-${month}` `` (month is `YYYY-MM`) and hold one `Rating` per criterion index from `criteria` in `data.ts`.
- Evaluation status moves `draft → updated → locked`. When it is `locked`, `updateRating` refuses edits.
- A class that still has students cannot be deleted. The portal shows a notice instead.

## Conventions

- **UI components: use shadcn/ui first.** Install with `pnpm dlx shadcn@latest add <name>` and use it; never hand-write a component shadcn provides. Theme colors are CSS variables in `src/app/tailwind.css`, so don't restyle inside `components/ui/` (use `className` at the call site). After `add`, check that imports use `@/lib/utils` (the CLI once generated `from "cn"` and installed a stray `cn` package). Details: [docs/ui-guidelines.md](docs/ui-guidelines.md).
- **Never hard-code the center name, short name, logo initial, or email domain.** Import `siteConfig` from `@/config/site`. Its values come from the `NEXT_PUBLIC_CENTER_*` variables in `.env` (see `.env.example`). The name is a placeholder ("ABC") and will be replaced later.
- `NEXT_PUBLIC_*` values are inlined at build time. Always write `process.env.NEXT_PUBLIC_X` literally and never look the name up dynamically.
- Write components as arrow functions. Components use named exports. `app/` pages and layouts use default exports.
- Use `"use client"` only where hooks or browser APIs are needed.
- Styling:
  - The portal and `components/` use Tailwind v4 (`src/app/tailwind.css`, imported with `important`). Theme tokens are `brand-*`, `coral-*`, `surface`, and `shadow-card`.
  - The landing page uses `globals.css` (minified, CSS variables) and the login page uses `login.module.css`.
- **Follow [docs/ui-guidelines.md](docs/ui-guidelines.md) for landing/login UI**: text buttons have no icons and never wrap; the header's only primary button is the green "Đăng nhập"; never split Vietnamese compound words across lines (use `keep()` in `page.tsx`, no hard-coded `<br/>`); CTAs in card rows align to the bottom; every section has side padding; don't show specifics (schedules, numbers) without real data.
- Fonts: Be Vietnam Pro (body) and Lora (headings), loaded via `next/font/google` with the `vietnamese` subset in `layout.tsx`.
- Color contrast: coral text uses `--coral-ink` / `coral-600` (`#b84a33`). Plain `--coral` / `coral-500` is for decoration only, because it fails WCAG on light backgrounds.
- Import with the `@/` alias for `src/`.
- Match the existing dense, mostly single-line JSX style. All user-facing copy is Vietnamese.
