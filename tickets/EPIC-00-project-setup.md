# EPIC-00 — Project Setup & Foundation

Not a feature from the brief — the groundwork every other epic depends on.

---

## TICKET-001: Initialize repository & tooling

**Priority:** P0 · **Status:** Done · **Depends on:** —

### Description
Scaffold the Next.js + TypeScript project, install the chosen dependencies
(Tailwind, Prisma, NextAuth, Recharts), and get a blank app running locally.

### Acceptance Criteria
- [x] Next.js (App Router) + TypeScript project created and runs locally —
      verified with `npm run build` and a live `npm run dev` smoke test
      (headless-browser screenshot of every route, 0 console errors)
- [x] Tailwind CSS configured and a test page confirms styles apply — the
      nav shell (TICKET-005) is styled entirely with Tailwind utility
      classes and renders correctly (see screenshots taken during
      verification)
- [x] Prisma CLI + Client installed, schema written, `prisma generate`
      succeeds
- [x] Connected to a running PostgreSQL instance and migrated
      (`npx prisma migrate dev --name init`) — see TICKET-003. Found an
      existing local PostgreSQL 18 Windows service already running on
      this machine and created a dedicated `calorietrack_ng`
      role/database on it rather than installing anything new — see
      `journal.md`'s 2026-08-29 (later) entry for how
- [x] `.env.example` documents `DATABASE_URL`, `NEXTAUTH_SECRET`,
      `NEXTAUTH_URL`
- [x] `.gitignore` excludes `node_modules`, `.env*` (with `.env.example`
      explicitly un-ignored so it stays committable — this was a real bug
      caught during setup: `.env*` silently swallowed `.env.example` too),
      `.next/`, build output

---

## TICKET-002: Architecture decision record for the stack

**Priority:** P0 · **Status:** Done (recorded in `README.md`) · **Depends on:** —

### Description
Record the stack choice (Next.js, Prisma/PostgreSQL, NextAuth, Recharts) and
the reasoning, so future tickets don't re-litigate it. Already captured in
the root `README.md` "Technologies and tools" and "Important decisions"
sections — this ticket exists so the decision is traceable to a ticket like
everything else.

### Acceptance Criteria
- [x] Stack and rationale documented in `README.md`
- [x] Revisit if any later epic (e.g. food search) hits a limitation that
      forces a change — record the change in `journal.md` if so. First
      instance: pinning `prisma`/`@prisma/client` to an exact stable
      version instead of "latest" — see `journal.md`'s 2026-08-29 entry

---

## TICKET-003: Database schema & ORM setup

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-001

### Description
Define the initial Prisma schema covering the entities needed across
epics: `User`, `Profile`, `Food`, `MealEntry`, `WeightLog`. This is the
schema skeleton — individual epics (03, 05, 09) will extend/refine their
own models in detail, but the relationships need to exist up front so
foreign keys aren't retrofitted later.

Written at `prisma/schema.prisma`. Also folded in the fields that later
audit decisions already committed to, so nothing needs retrofitting:
`User.role` (TICKET-040), `Profile.goalWeight` (TICKET-037),
`Profile.dailyCalorieTarget`/`proteinTargetG`/`carbsTargetG`/`fatTargetG`
(EPIC-02), `Food.isArchived` (TICKET-043).

Pinned `prisma`/`@prisma/client` to `6.19.3` (exact) rather than
"latest" — see `journal.md`'s 2026-08-29 entry for why.

### Acceptance Criteria
- [x] Prisma schema defines `User`, `Profile`, `Food`, `MealEntry`,
      `WeightLog` with correct relations (1 user → 1 profile, 1 user →
      many meal entries, 1 meal entry → 1 food, 1 user → many weight logs)
- [x] Initial migration created and applied
      (`prisma/migrations/20260829011450_init`) against a real PostgreSQL
      18 database — all 5 tables + 5 enums + indexes + foreign keys
      confirmed present via `psql \dt` and exercised end-to-end through
      EPIC-01's sign-up/profile flow (see that epic's top note)
- [x] Schema reviewed against Section 10's food fields (name, category,
      calories, protein, carbs, fat, serving size) — all present, plus
      `servingSize` documented as a display string, not arithmetic input

---

## TICKET-004: Dev scripts — lint, format, typecheck, test runner

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-001

### Description
Set up ESLint, Prettier, TypeScript strict mode, and a test runner
(Vitest or Jest) so every subsequent ticket has a way to verify itself.
Went with Vitest over Jest — faster, zero-config TS support, matches the
Vite-family tooling already in the Next.js/Tailwind toolchain.

### Acceptance Criteria
- [x] `npm run lint`, `npm run format` / `format:check`, `npm run
      typecheck` all run clean against the current codebase
- [x] Test runner (Vitest) configured, `npm run test` runs; originally
      one placeholder test, since replaced by real coverage
      (`src/lib/calorie-target.test.ts`, 11 tests) once EPIC-01 pulled
      forward the calorie-calculation pure functions — see
      `tickets/EPIC-01-auth-profile.md`
- [x] Markdown planning docs (`*.md`) excluded from Prettier's scope —
      they're hand-formatted prose/tables, not code; auto-reformatting
      them wasn't the intent of this ticket
- [x] Scripts documented in `README.md`'s new "Development" section

---

## TICKET-005: App shell — main navigation + Add Food button

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-001

### Description
Section 12 specifies the MVP navigation: five sections (Dashboard, Food,
History, Progress, Profile) plus a prominent **+ Add Food** button
available from the shell. Build the layout shell and routing skeleton
(empty pages are fine — content is filled in by later epics).

Built as `src/components/main-nav.tsx` (client component, uses
`usePathname` for active-route state), wired into
`src/app/(app)/layout.tsx` (moved there from the root layout during
EPIC-01, when routes were split into protected `(app)` and public
`(auth)` groups — see `tickets/EPIC-01-auth-profile.md`). Root `/`
redirects to `/dashboard` (now auth-aware — see EPIC-01). Placeholder
pages share one `PlaceholderPage` component so each route's "not built
yet" state points at the ticket that will fill it in.

### Acceptance Criteria
- [x] Persistent navigation with exactly the five sections from Section 12
- [x] Active-route highlighting (verified — Dashboard link shown
      highlighted on `/dashboard` screenshot)
- [x] "+ Add Food" button visible from every main section, not just
      Dashboard — it's in the shared header, so this is automatic (see
      TICKET-020 for the full flow it opens; today it links to `/food/add`,
      a placeholder)
- [x] Responsive: verified at 1280px and 375px viewport widths via
      headless-browser screenshots — nav wraps to a second row on mobile
      without breaking layout
- [x] Routes exist (as placeholders) for `/dashboard`, `/food`,
      `/food/add`, `/history`, `/progress`, `/profile` — all verified to
      render with zero console errors
