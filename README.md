# CalorieTrack NG

## What this is

CalorieTrack NG is a web-based MVP calorie tracker. Users create a profile, get a
daily calorie target calculated for them, log the food they eat against
Breakfast / Lunch / Dinner / Snacks, and see how their intake compares to
their target for the day — plus a simple history, a weekly trend chart, and
basic weight tracking.

The full product brief lives in
[`CalorieTrack_NG_MVP_Requirements(1) (1).txt`](<CalorieTrack_NG_MVP_Requirements(1) (1).txt>).
This repository turns that brief into a ticket-based implementation plan
before any code is written — see [`tickets/`](tickets/INDEX.md).

## Who it's for

Everyday users in Nigeria (and anyone eating Nigerian food) who want a
lightweight way to see "how many calories have I eaten today, and am I over
or under my target?" — without the clutter of a generic international
calorie app. The food database is seeded with common Nigerian meals (Jollof
Rice, Eba, Amala, Egusi Soup, Akara, Moi Moi, Pounded Yam, etc.) alongside
generic staples, so users don't have to hunt for equivalents or manually
enter nutrition data for the meals they actually eat.

## The problem it solves

Most calorie trackers are built around Western/international food
databases. A Nigerian user logging Jollof Rice, Eba and Egusi Soup either
can't find the food, or has to manually estimate and enter nutrition data
every time — enough friction that people give up on tracking within days.

CalorieTrack NG solves the core workflow — profile → daily target → search
food → log it against a meal → see progress — for a food database that
already matches what the target user eats, and keeps everything else
(auth, dashboard, history, admin) deliberately minimal so that workflow
works well before anything else is added.

## Technologies and tools (planned stack)

No code has been written yet — the stack below is the decision this plan is
built against, recorded so every ticket assumes the same architecture.

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + TypeScript, via Next.js (App Router) | One codebase for UI and API routes — less deployment/config overhead for a solo-built MVP than a separate frontend/backend. |
| Styling | Tailwind CSS | Fast to build the dashboard/progress-bar-heavy UI described in the brief without hand-rolling a component library. |
| Backend API | Next.js API routes / Route Handlers (Node.js, TypeScript) | Same reasoning as frontend — avoids standing up and hosting a second service for an MVP. |
| Database | PostgreSQL | Relational data (users, profiles, food entries, meals, weight logs) with real relationships and daily/weekly aggregation queries — a better fit than a document store. |
| ORM | Prisma | Type-safe schema + migrations, keeps the data model (Section 10's food fields, meal categories, etc.) explicit and versioned. |
| Auth | NextAuth.js (credentials provider) + bcrypt | Email/password is all Section 2 requires; NextAuth avoids hand-rolling session/token handling. |
| Charts | Recharts | Covers the weekly calorie trend (Section 8) and weight-over-time chart (Section 9) with minimal setup. |
| Hosting (target) | Vercel (app) + managed Postgres (e.g. Neon/Supabase) | Matches the Next.js/Prisma choice; no infra to manage for an MVP. |

This is a starting decision, not a constraint carved in stone — if a ticket
surfaces a reason to deviate (e.g. the food-search needs full-text search
Postgres can't do cheaply), that will be raised and recorded in the journal
when it happens.

## Important decisions

- **Tickets before code.** Every feature in the brief (Sections 2–13) was
  broken into epics and tickets under [`tickets/`](tickets/INDEX.md) before
  any implementation starts, so scope and acceptance criteria are explicit
  and reviewable up front.
- **Admin dashboard is in scope, not deferred.** Section 13's numbered MVP
  feature list doesn't mention it explicitly, but Section 11 specifies it in
  detail and the food database (Section 10) has no other way to be
  maintained after the initial seed. It's included as `EPIC-10`, but scoped
  down to the minimum CRUD + read-only views the brief describes — no
  additional admin functionality was invented.
- **Nigerian food list seeds the database, not just examples.** The foods
  named in Section 15 (Akara, Pap, Moi Moi, Jollof Rice, Eba, Amala, Pounded
  Yam, Egusi Soup, Okra Soup, Afang Soup, etc.) plus the generic examples in
  Section 4 (Rice, Beans, Chicken, Egg, Bread, Yam, Banana, Apple) are
  treated as the required MVP seed set, not illustrative examples to
  paraphrase.
- **Daily calorie target uses a standard formula.** The brief says the app
  "can use this information to estimate" a target but doesn't name a
  method. Mifflin-St Jeor (BMR from age/gender/weight/height, scaled by
  activity level, then adjusted by goal) was chosen as the standard,
  well-documented approach — recorded as an explicit decision in
  `EPIC-02` rather than left ambiguous.
- **Exercise calories (Section 3's "Exercise: 200 kcal") are display-only
  for the MVP.** Exercise tracking is explicitly listed under Future
  Features (Section 14), so no logging UI is planned for it now; the
  dashboard ticket treats it as a value that can be wired up later without
  reshaping the summary layout.

## Challenges encountered (planning stage)

- **Scope boundary between "MVP" and "Future Features."** The brief lists
  MVP features in Section 13 and explicitly deferred features in Section
  14, but a few things (admin dashboard, exercise calories) sit in the gap.
  Resolved by cross-referencing every ambiguous feature against both
  section lists and the detailed feature sections (2–11), and recording the
  reasoning above instead of silently picking one interpretation.
- **No specified calorie-calculation formula.** Addressed by picking
  Mifflin-St Jeor explicitly (see above) so the ticket for `EPIC-02` has a
  concrete, testable acceptance criterion instead of "calculate a
  reasonable target."
- **Ticket granularity.** Early drafts risked either one giant ticket per
  numbered section (too coarse to implement/review incrementally) or a
  ticket per UI element (too fragmented to track). Settled on one epic per
  requirements section/feature area with 3–6 tickets each, sized so each
  ticket is independently implementable and testable — see
  [`tickets/INDEX.md`](tickets/INDEX.md) for the full breakdown.

## Project layout

```
CalorieTracker/
├── README.md                          # this file
├── journal.md                         # running project journal
├── CalorieTrack_NG_MVP_Requirements(1) (1).txt   # source requirements
├── tickets/
│   ├── INDEX.md                       # full ticket list, epic by epic
│   └── EPIC-00 … EPIC-10 ...md        # one file per epic
├── prisma/
│   └── schema.prisma                  # data model (TICKET-003)
└── src/
    ├── app/                           # Next.js App Router routes
    ├── components/                    # shared UI (nav, placeholders)
    └── lib/                           # prisma client, pure logic, tests
```

## Development

Requires Node.js 20+ and a PostgreSQL database.

```bash
npm install                 # installs deps; postinstall runs `prisma generate`
cp .env.example .env.local  # then fill in DATABASE_URL / NEXTAUTH_SECRET
npx prisma migrate dev --name init   # creates the database schema
npm run dev                 # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm run lint`,
`npm run typecheck`, `npm run format` / `format:check` (Prettier — scoped
to code, not the hand-formatted `*.md` planning docs), `npm run test`
(Vitest).

## Status

**EPIC-00** (project setup) and **EPIC-01** (auth & profile) are
implemented: Next.js 16 + TypeScript + Tailwind app, Prisma schema, dev
tooling, the main navigation shell, sign-up/login/logout (NextAuth v5,
credentials + JWT sessions), route protection, and the profile
onboarding/edit form — which also required pulling forward EPIC-02's
BMR/TDEE/goal-adjustment calculation (`src/lib/calorie-target.ts`, fully
unit-tested) since the profile form needs it at save time. See
`tickets/INDEX.md`'s "Cross-epic build-order exceptions" for why.

Verified with a production build, typecheck, lint, tests (11 passing),
and headless-browser smoke tests — every route, every unauthenticated
redirect, and both public forms render correctly with zero console
errors.

**Not yet done:** no PostgreSQL instance was available in the environment
this was built in, so nothing that touches Prisma at runtime — sign-up,
login, profile save — has been exercised end-to-end against a real
database. Schema validation (`prisma generate`) passes; the actual
migration (`npx prisma migrate dev --name init`) has never been run. This
is the first thing to do next — see `TICKET-001`/`TICKET-003` in
`tickets/EPIC-00-project-setup.md`, and `TICKET-006`–`010` in
`tickets/EPIC-01-auth-profile.md` for what to verify once a database is
available.

Next up per `tickets/INDEX.md`: `EPIC-03` (food database) — `EPIC-02`'s
remaining scope (macro targets, `TICKET-013`) is what's left there after
the calculation core was pulled into EPIC-01.
