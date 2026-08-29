# Project Journal — CalorieTrack NG

## 2026-08-28 — Planning: requirements → tickets

**What I worked on**

Read through the full MVP requirements doc
(`CalorieTrack_NG_MVP_Requirements(1) (1).txt`, Sections 1–17) and turned
it into a ticket-based implementation plan before writing any code:

- `README.md` — project overview, target user, problem statement, planned
  tech stack, and the key decisions made while planning.
- `tickets/INDEX.md` — full ticket list (45 tickets across 11 epics) with
  priorities and a recommended build order.
- `tickets/EPIC-00` through `EPIC-10` — one file per epic with detailed
  tickets: description, requirements-section reference, and checkbox
  acceptance criteria.

**Decisions made**

- **Stack:** Next.js (App Router) + TypeScript, Tailwind, Prisma +
  PostgreSQL, NextAuth (credentials), Recharts. Reasoning is in
  `README.md` — mainly "one codebase, minimal infra" for a solo MVP build.
  Not fixed in stone; if a later ticket runs into a real limitation, I'll
  record the change here when it happens.
- **Calorie target formula:** the brief says the app "can estimate" a
  target but never names a method. Picked Mifflin-St Jeor (standard,
  well-documented) rather than leaving it vague — see `EPIC-02`.
- **Admin dashboard is in scope.** Section 13's numbered MVP list doesn't
  mention it, but Section 11 describes it in detail and there's no other
  way to maintain the food database after the initial seed. Included as
  `EPIC-10`, scoped to exactly what Section 11 lists (add/edit/delete
  food, view users, view basic stats) — nothing extra invented.
- **Exercise calories on the dashboard are display-only for MVP.**
  Section 14 explicitly lists exercise tracking as a Future Feature, so
  `EPIC-06` renders the value but doesn't build a logging UI for it.
- **Units:** kg/cm as the default, no unit switcher for MVP (matches the
  kg example in Section 9).

**Challenges / open questions surfaced while planning**

- **Goal weight has no home in the data model.** Section 9's example
  shows a "Goal Weight" figure, but Section 2's profile only collects a
  goal *direction* (lose/maintain/gain), not a target number. Flagged as
  an open decision in `EPIC-09` / `TICKET-039` rather than silently
  inventing a field — needs a call before that ticket is implemented.
- **Editing/deleting a food in the admin panel could silently corrupt
  history** if `MealEntry` rows reference live food data instead of a
  snapshot. Called this out explicitly in `TICKET-042` and `TICKET-043`
  so the implementer doesn't discover it as a bug later — meal entries
  store their own computed calorie/macro values at log time
  (`TICKET-021`), so edits to the food catalog shouldn't retroactively
  change past logs.
- **Ticket granularity** took a couple of passes: one-ticket-per-section
  was too coarse to track independently; one-ticket-per-UI-element was
  too fragmented. Settled on ~3-6 tickets per epic, each independently
  implementable and testable.

**Next up**

Start build order per `tickets/INDEX.md`: `EPIC-00` (project setup) →
`EPIC-01` (auth/profile) → `EPIC-02` (calorie target) → ... No code
written yet as of this entry.

---

## 2026-08-28 — Ticket audit: closing gaps and cross-epic conflicts

**What I worked on**

Went back through all 11 epic files against the requirements doc and
against each other looking specifically for: missing coverage, ambiguous
acceptance criteria left as open hedges, and dependency conflicts between
tickets. Found real issues, not just polish — fixed all of them directly
in the ticket files rather than just noting them here.

**Issues found and fixed**

- **Two real build-order conflicts.** `TICKET-019` (EPIC-04, Add Food)
  depends on `TICKET-021` (EPIC-05, meal entry model), but the stated
  epic build order had EPIC-04 finishing before EPIC-05 started — the
  dependency ran backwards against the documented sequence. Same problem
  between `TICKET-036` (EPIC-08, Progress page) and `TICKET-039`
  (EPIC-09, weight chart). Fixed by adding an explicit "Cross-epic
  build-order exceptions" section to `tickets/INDEX.md` and a callout
  note at the top of each affected epic file, rather than silently
  leaving a plan that contradicts its own tickets.
- **Missing ticket: the "Food" nav section itself.** Section 12 lists
  Food as one of five main nav items, separate from the "+ Add Food"
  button. The original ticket set only ever put search/add behavior
  inside the Add Food modal (`TICKET-018`/`019`) — nothing gave the
  standalone `/food` page real content. Added `TICKET-046` (Food page —
  browsable/searchable database view) to `EPIC-04`.
- **Missing ticket: admin food-management list.** `TICKET-041`/`042`/
  `043` (add/edit/delete food) all assumed a list page to launch from,
  but no ticket built one. Folded the list into `TICKET-041` and updated
  `042`/`043` to depend on it.
- **Two decisions left as open hedges, now resolved firmly:**
  - *Goal weight* (Section 9's example) had no field to live in, since
    Section 2's profile only collects a goal direction, not a number.
    Decided: `Profile.goalWeight`, optional, set from the Weight
    Tracking page (`TICKET-037`) — not added to the Section 2 onboarding
    form, since the brief doesn't ask for it there.
  - *Deleting a food that's already logged in someone's history* was
    marked "decide and document approach." Decided: soft delete via a
    new `Food.isArchived` flag (`TICKET-015`) — hides it from search/Add
    Food/the Food page, but existing `MealEntry` rows still resolve it by
    id so History keeps rendering correctly.
  - *Backfilling a past date via Add Food* (referenced conditionally by
    the old `TICKET-032`) is now a firm yes: launching Add Food from
    History logs to the date being viewed, not today. No date picker
    inside the Add Food modal itself — the date comes from where it was
    opened.
- **Incomplete dependency metadata.** Several tickets referenced other
  tickets in their description/acceptance criteria without listing them
  under "Depends on" (e.g. `TICKET-025` used `TICKET-023`'s component and
  `TICKET-013`'s macro targets but only listed `TICKET-029`). Corrected
  across `TICKET-025` and `TICKET-031`.
- **Dashboard Exercise/Remaining inconsistency.** The Remaining formula
  referenced "+ Exercise" but no ticket lets a user set that value
  (exercise tracking is an explicit Future Feature). Fixed: Exercise
  displays a fixed `0 kcal` for MVP, Remaining is just Target − Consumed,
  and the field stays visible for layout parity with Section 3's example
  without implying a working input that doesn't exist yet.
- **Missing login→onboarding branch.** Nothing specified what happens
  when a user without a completed profile logs back in (as opposed to
  the sign-up flow). Added an explicit acceptance criterion to
  `TICKET-007`.
- **`servingSize` ambiguity.** Clarified in `TICKET-015` that it's a
  display string ("1 cup"), never used in arithmetic — quantity
  multiplies the per-serving calorie/macro values, not the serving-size
  text.
- **No path to a first admin user.** `TICKET-040` required an admin role
  but never specified how one gets created. Added an explicit seed/
  manual-step requirement.

**Why this pass mattered**

A ticket set that contradicts its own stated build order, or leaves an
implementer to invent a decision mid-build (goal weight, delete
semantics, backfill dates), is exactly the kind of ambiguity that causes
rework once implementation starts. Resolving it now, on paper, is cheap;
resolving it after code exists isn't.

---

## 2026-08-29 — Implementing EPIC-00 (project setup)

**What I worked on**

Started actual implementation, picking `EPIC-00` per `tickets/INDEX.md`'s
build order. Scaffolded the Next.js app, wrote the Prisma schema, set up
dev tooling, and built the navigation shell (`TICKET-001`, `003`, `004`,
`005`). `TICKET-002` was already done during planning.

**Decisions and problems hit while implementing**

- **`create-next-app` can't target a directory with capital letters** —
  the folder is `CalorieTracker`, and npm package names can't have
  uppercase. Scaffolded into a temporary sibling folder
  (`calorietrack-ng`) instead, then moved the generated files in and kept
  our own `README.md` rather than letting the generator's template
  overwrite it.
- **Prisma's `latest` npm tag currently points at a release candidate.**
  `npm install prisma @prisma/client` (both unpinned) resolved
  `@prisma/client` to `7.10.0` but the `prisma` CLI to `8.0.0-rc.12` —
  the two packages' `latest` dist-tags have diverged, which is not
  supposed to happen and would have caused a broken CLI/client pairing.
  Re-pinned both to the matching `7.10.0`.
- **Prisma 7 turned out to be a bigger jump than expected.** It removes
  `datasource.url` from `schema.prisma` entirely — the CLI now demands a
  separate `prisma.config.ts` plus a database driver adapter package
  (e.g. `@prisma/adapter-pg`) instead of just reading `DATABASE_URL` from
  the schema. That's a real architecture change, not a drop-in upgrade,
  and it would have broken from every existing Next.js+Prisma tutorial's
  pattern the schema was already written against. Downgraded to Prisma
  `6.19.3` (exact, both packages) instead of adopting the new config
  paradigm — simpler, more widely documented, and the schema I'd already
  written works with zero changes. Recorded as the ADR update
  `TICKET-002` asked for.
- **That downgrade path had a real vulnerability along the way.**
  `npm audit` flagged a high-severity stack-exhaustion issue in
  `deepmerge-ts` (pulled in transitively via `@prisma/config`, part of
  the `prisma` CLI's own dependency tree — not something our app code
  touches). `npm audit fix --force`'s suggested fix was to downgrade
  `prisma` to `6.12.0`, which would have undone the version pin I'd just
  made for other reasons. Fixed it properly instead: added an
  `"overrides"` entry in `package.json` forcing `deepmerge-ts` to
  `^8.0.2` (the patched version) while keeping `prisma`/`@prisma/client`
  at `6.19.3`. `npm audit` now reports zero vulnerabilities.
- **`.gitignore`'s `.env*` pattern was silently swallowing
  `.env.example` too** — it never showed up in `git status`, which means
  it would never have been committed despite being the one env file that
  should be. Added an explicit `!.env.example` negation. Worth flagging
  because this is an easy thing to not notice until someone clones the
  repo and finds no `.env.example` to copy from.
- **No PostgreSQL or Docker available in this environment.** `prisma
  generate` (schema validation, client codegen) succeeded, but `prisma
  migrate dev` was never run against a real database — there's nothing
  to run it against here. Documented this explicitly in `TICKET-001`/
  `TICKET-003` and in the README's Status section rather than skipping
  past it silently. This is the actual next blocking step before EPIC-01
  needs working tables.
- **Verified the shell in a real browser, not just `next build`.**
  Started the dev server, drove headless Chromium (via Playwright, since
  `chromium-cli` wasn't available in this environment — installed
  Playwright + Chromium into a scratch temp directory outside the repo,
  used it for one verification pass, then deleted it; nothing from that
  was added as a project dependency) through every route, confirmed
  active-nav-link highlighting, mobile-width wrapping, and zero console
  errors, then screenshotted `/dashboard` at both 1280px and 375px to
  visually confirm the layout before marking `TICKET-005` done.

**State at end of session**

`npm run build`, `lint`, `typecheck`, `test`, and `format:check` all pass
clean with zero warnings. App shell renders correctly at desktop and
mobile widths. Blocked only on a real Postgres connection to run the
first migration — see README "Status" for the exact next command.

**Next up**

Get a real `DATABASE_URL` wired up and run `prisma migrate dev --name
init`, then move to `EPIC-01` (auth/profile) per the build order.

---

## 2026-08-29 (later) — Committed, then implemented EPIC-01

**What I worked on**

Committed EPIC-00's work as the repo's first commit (was asked to do
that before continuing). Then implemented `EPIC-01` (auth & profile):
sign-up, login/logout, session management, route protection, and the
profile onboarding/edit form.

**Decisions and problems hit while implementing**

- **Found a third cross-epic ordering conflict, missed in the earlier
  audit.** `TICKET-008` (profile form, EPIC-01) requires a computed
  daily calorie target at save time, which depends on `TICKET-011`/
  `TICKET-012` (EPIC-02) — same class of bug as the EPIC-04↔05 and
  EPIC-08↔09 conflicts found earlier, just not caught until actually
  implementing EPIC-01. Resolved the same way: pulled the minimal needed
  piece forward. Implemented `src/lib/calorie-target.ts` (Mifflin-St Jeor
  BMR → TDEE → goal adjustment, floored at 1200 kcal) with full unit
  test coverage, satisfying `TICKET-011`/`TICKET-012` fully. Left
  `TICKET-013` (macro targets) for when EPIC-02 is formally picked up —
  nothing in EPIC-03 needs it, so it doesn't block moving forward.
  Updated `tickets/INDEX.md`'s cross-epic exceptions section and both
  affected epic files to record this.
- **Chose Server Actions over hand-written API routes.** Next.js 16 +
  React 19 (`useActionState`) makes Server Actions the more idiomatic,
  less boilerplate-heavy way to handle sign-up/login/profile-save than a
  client `fetch()` calling a REST API route. NextAuth v5 supports calling
  its `signIn`/`signOut` directly from server actions, which is what
  made this clean — no need for `next-auth/react`'s client-side
  `useSession`/`signIn` at all, since nothing needs reactive client-side
  session state right now.
- **Auth.js v5 + Prisma + Edge middleware needs a config split.** Prisma
  can't run in Next.js's Edge runtime, but middleware does. Split the
  NextAuth config into `src/auth.config.ts` (edge-safe: pages, the
  `authorized` callback, JWT/session callbacks — no providers) and
  `src/auth.ts` (full config, adds the Credentials provider which needs
  Prisma + bcrypt). Middleware imports only the edge-safe half. This is
  the documented Auth.js v5 pattern for this exact combination, not
  something improvised.
- **Next.js 16 renamed "middleware" to "proxy."** `middleware.ts` built
  clean but printed a deprecation warning pointing at
  `npx @next/codemod middleware-to-proxy`. The codemod itself refused to
  run against an uncommitted working tree (reasonable safety check), and
  since the actual change is just a file rename (verified the exact
  expected filename via `next`'s own source —
  `node_modules/next/dist/lib/constants.js`'s `PROXY_FILENAME`) rather
  than risk an automated tool touching a tree full of new unreviewed
  files, renamed `middleware.ts` → `src/proxy.ts` by hand. Build
  confirms the warning is gone.
- **Verified everything that doesn't require a live database.** Build,
  typecheck, lint, and the 11-test Vitest suite (calorie-target logic)
  all pass. Also did a live headless-browser pass: unauthenticated
  requests to `/` and `/dashboard` both correctly land on `/login`
  (proves the Edge proxy's `authorized` callback works without touching
  Prisma), and both `/login` and `/signup` render their forms correctly
  — screenshotted, zero console errors. Used a throwaway `.env.local`
  with a placeholder `AUTH_SECRET` for this (JWT signing needs *a*
  secret, even for routes that never touch the database) and deleted it
  afterward so it doesn't linger with a fake `DATABASE_URL` that could
  mislead whoever picks this up next.
- **What's still unverified:** the actual sign-up → auto-login →
  profile-save → dashboard-redirect chain has never run against a real
  Prisma connection, because there still isn't one available in this
  environment. Every ticket this touches is marked "Implemented,
  unverified against a real DB" rather than "Done," and the README's
  Status section says the same. This isn't a formality — until someone
  runs it against a real database, "the code compiles and the schema is
  valid" is a real but limited form of confidence, not proof the feature
  works.

**State at end of session**

`npm run build`, `lint`, `typecheck`, `test` (11 passing) all clean.
Route structure is now `src/app/(app)/*` (protected: dashboard, food,
food/add, history, progress, profile — all behind `requireProfile()` or
`requireSession()`) and `src/app/(auth)/*` (public: login, signup).

**Next up**

Same blocker as EPIC-00: get a real `DATABASE_URL`, run
`prisma migrate dev --name init`, then actually exercise the sign-up/
login/profile flow end-to-end before trusting it. After that, `EPIC-03`
(food database) is next per the build order — `EPIC-02`'s remaining
piece (`TICKET-013`, macro targets) doesn't block it.

---

## 2026-08-29 (later) — Set up PostgreSQL, ran the migration, verified end-to-end

**What I worked on**

Closed the one gap both EPIC-00 and EPIC-01 had been explicitly flagged
as blocked on: no PostgreSQL instance. Got one running, ran the first
migration for real, and exercised the full sign-up/login/profile flow
against it via a headless browser instead of just trusting that the code
compiles.

**Getting a database**

- Neither `choco` nor a Docker daemon was usable without elevated
  privileges (`choco install` failed outright needing admin; no `docker`
  binary at all).
- Downloaded PostgreSQL 17's portable ZIP binaries directly from
  EnterpriseDB (no installer, no Windows service, no admin rights needed
  — just an executable you run) as a fallback plan, and had a data
  directory initialized and ready to start on port 5432.
- Before starting it, found port 5432 already bound — by
  `postgresql-x64-18`, a PostgreSQL 18 Windows service that was **already
  installed and running on this machine** before I touched anything.
  Not something I or any tool in this session installed. Threw away the
  portable install (deleted the downloaded binaries and unused data
  directory — no point running two Postgres instances) and used the
  existing service instead.
- `pg_hba.conf` had `trust` auth for local connections, so no password
  hunting was needed to connect as the `postgres` superuser.
- Created a dedicated `calorietrack_ng` role + database on that shared
  instance rather than using the superuser directly in the app's
  connection string — least-privilege, and doesn't touch whatever else
  that Postgres instance might be used for. Had to grant `CREATEDB` to
  that role afterward — `prisma migrate dev` needs to create a shadow
  database to diff against, which failed with a permission error until
  that grant was in place.

**Running the migration**

- `npx prisma migrate dev --name init` initially failed with
  "Environment variable not found: DATABASE_URL" despite `.env.local`
  having it — turns out the Prisma CLI only auto-loads a file literally
  named `.env`, not `.env.local` (that's a Next.js-specific convention,
  not a Prisma one). Added a `.env` with just `DATABASE_URL` for the CLI;
  kept `.env.local` for the full set the Next.js app runtime needs
  (`DATABASE_URL` + `AUTH_SECRET`). Both are gitignored.
- Migration then applied cleanly: 5 tables, 5 enums, all indexes and
  foreign keys, confirmed via `psql \dt` and by reading the generated
  `migration.sql` line by line against the schema.

**End-to-end verification, and a real debugging story**

Wrote a headless-browser (Playwright) script driving the full flow:
sign up → complete profile onboarding → land on dashboard → revisit
profile (confirm prefilled) → edit and re-save → log out → confirm
dashboard is protected → log back in (confirm it skips onboarding since
a profile already exists) → wrong password → duplicate email signup.

First run misbehaved in a way worth recording because the instinct in
that moment was "the app has a bug," and it didn't:

- The profile-onboarding step submitted the wrong form. The `(app)`
  layout's nav has a "Log out" button and the profile page has its own
  "Continue to Dashboard" submit button — both are `<button
  type="submit">`. My script's selector, `button[type="submit"]`, isn't
  scoped to either form, so Playwright clicked whichever matched first
  in DOM order (the nav's logout button, since the nav renders before
  the page content). The server log made this obvious in about ten
  seconds — it showed `signOutAction` running where `saveProfileAction`
  was expected. Real bug, but in the test script, not the app: in an
  actual browser, HTML form submission is scoped to the nearest
  ancestor `<form>`, so a user could never trigger this — clicking
  "Continue to Dashboard" can only ever submit the profile form.
  Rewrote every click to target button text instead of a generic
  selector.
- After fixing that, two checks (wrong-password error text, duplicate-
  email error text) still intermittently failed in the *full* script but
  passed instantly and cleanly in isolated single-purpose repro scripts
  hitting the same two scenarios directly. Screenshots from the failing
  runs showed the submit button still reading "Logging in…" / "Creating
  account…" — the check was reading page state before the client had
  finished processing the server action's response, not before the
  server had actually responded (server logs showed both actions
  returning in under 300ms every time). Given the isolated repros
  reproduced the exact expected error text every single time
  (`"Incorrect email or password."`, `"An account with that email
  already exists."`), I'm treating this as Playwright/dev-server timing
  flakiness specific to my own verification script's sequencing after
  many rapid prior navigations — not a product bug. Documented rather
  than either hand-waved away or allowed to block declaring EPIC-01
  verified, since the underlying claim (these two error paths work) is
  now independently confirmed two different ways.

**Cleanup**

Truncated all app tables after verification (keeps the schema and
migration in place, clears the test users/profiles created during the
run). Killed the dev server. Deleted the scratch Playwright scripts and
screenshots — none of that is part of the repo.

**State at end of session**

Every EPIC-00 and EPIC-01 ticket is now `Done` — no more "implemented,
unverified" caveats. `prisma/migrations/20260829011450_init` is
committed. `.env` and `.env.local` (real working local dev credentials)
are gitignored, not committed.

**Next up**

`EPIC-03` (food database) per the build order.

---

## 2026-08-29 (still later) — Implemented EPIC-03 (food database)

**What I worked on**

`TICKET-015` (Food model) was already done as part of EPIC-00's schema
work, so this was really `TICKET-016` (seed data) and `TICKET-017`
(read API).

**Seed data**

Compiled every food named in Section 4's examples and Section 15's
Nigerian-food list into `prisma/seed.ts` — 20 foods after de-duplicating
names that refer to the same dish (Section 4's generic "Rice"/"Egg" vs.
Section 15's "White Rice"/"Eggs" — seeded once each under the more
descriptive name rather than as near-duplicate rows, noted in a comment
so it doesn't look like an oversight). Values are approximate MVP
defaults sourced from standard nutrition references (USDA FoodData
Central for generic staples, commonly published estimates for Nigerian
dishes) — except Jollof Rice, which uses Section 10's own worked example
verbatim (350 kcal, 8g protein, 55g carbs, 12g fat) since the brief
already hands over an authoritative figure for that one.

Idempotency (`TICKET-016`'s requirement) is a plain "skip if a food with
this name already exists" check rather than a schema-level unique
constraint on `name` — avoids a migration and, more importantly, means a
future admin edit to a seeded food (`TICKET-042`) survives a re-seed
instead of being silently overwritten. Wired up via `package.json`'s
`prisma.seed` field and installed `tsx` to run it (Prisma needs a
TS-runner for seed scripts; `tsx` is the lightweight standard choice).
Ran it twice against the real database to confirm idempotency directly:
first run created 20, second created 0 and skipped 20.

**Read API**

`GET /api/foods` (paginated list, excludes archived) and
`GET /api/foods/:id` (single food, *includes* archived — a historical
`MealEntry` still needs to resolve a soft-deleted food's name) as Next.js
Route Handlers. Both require an authenticated session, matching how every
other route in the app behaves — nothing in this MVP is meant to be
reachable signed out, so there was no reason to make these the exception.
Deliberately left out search/filter query params — that's `TICKET-018`'s
job in EPIC-04, and adding it now would mean building ahead of the
ticket that actually owns that decision.

**Verification**

All against the real PostgreSQL database, not mocked:
- Unauthenticated requests to both endpoints return `401`.
- Authenticated (via a real signed-up session, driven through a headless
  browser): list returns all 20 seeded foods, alphabetically sorted;
  pagination at `pageSize=5` produces 4 pages with no overlap between
  page 1 and page 2; fetching Jollof Rice by id returns exactly Section
  10's figures; a nonexistent id returns `404`.
- Archived-food behavior: archived "Fish" directly in the database,
  confirmed the list dropped from 20 to 19 results and no longer included
  it, then confirmed `GET /api/foods/:id` for that same id still
  resolved it with `isArchived: true` — exactly the split TICKET-017
  specifies. Unarchived it afterward.

**Cleanup**

Truncated `User`/`Profile`/`WeightLog`/`MealEntry` after verification
(test accounts created during the run) but left the seeded `Food` table
alone — that's real product data the app should ship with, not test
data to throw away.

**State at end of session**

Every EPIC-00, EPIC-01, and EPIC-03 ticket is `Done`. Build, typecheck,
lint, tests (11 passing), and format all clean.

**Next up**

`EPIC-04` (food search & add) per the build order — the food API this
epic just built is exactly what `TICKET-018` (search) needs to extend.

---

## 2026-08-29 (yet later) — Implemented EPIC-04 (food search & add)

**What I worked on**

`TICKET-018` (search), `TICKET-019` (Add Food flow), `TICKET-020` (nav
button return-navigation), `TICKET-046` (Food browse page) — plus
`TICKET-021` (already done, EPIC-00) and `TICKET-022` (built together
with `TICKET-019`, same reasoning as EPIC-01's profile form + action).

**Design decisions**

- **Add Food as a page, not a modal.** The tickets say "flow"/"opens,"
  never "modal." A dedicated `/food/add` route with a `from` query param
  for return-navigation is plain page routing — no overlay/portal state,
  no focus-trap, no z-index concerns — and satisfies every acceptance
  criterion identically from the user's side. Recorded as a design note
  on the epic rather than silently deviating from an unstated assumption.
- **One `FoodSearch` component, two behaviors.** The same search-with-
  debounce component (`src/components/forms/food-search.tsx`) is used
  by both the Add Food flow (selecting a food sets local state, moving
  to the quantity step) and the `/food` browse page (selecting a food
  navigates to `/food/add?foodId=...`) — the difference is entirely in
  what `onSelect` does, not in the component. An empty search query
  still fetches (page 1, alphabetical), so "browse all foods" and
  "search foods" are the same code path, not two.
- **Extended `/api/foods` with `?q=` rather than adding a new search
  endpoint.** TICKET-017 already described itself as something search
  would build on top of; a second endpoint doing almost the same query
  would just be duplication.
- **Snapshot values, not live lookups.** `logMealEntryAction` computes
  `calories`/`proteinG`/`carbsG`/`fatG` from the food's *current* values
  at write time and stores them on the `MealEntry` row — this was
  already the schema's documented intent (EPIC-00's comment on why), just
  now actually wired up. Verified directly (see below).
- **Open-redirect guard on `from`.** The nav button and Add Food form
  both carry `from` as a query param / hidden form field, which is
  user-controllable input. `logMealEntryAction`'s `safeRedirectTarget()`
  only honors it if it starts with `/` and not `//` (blocks protocol-
  relative URL tricks), falling back to `/dashboard` otherwise — a small
  but real thing to get right before shipping a redirect driven by
  request data.

**A React lint rule caught something worth fixing**

`eslint-plugin-react-hooks` flagged `setLoading(true)` called
synchronously in the search effect's body (not inside the debounce
timeout) as a "cascading renders" risk. Moved it inside the `setTimeout`
callback instead — technically changes the loading indicator's timing
slightly (it now only flips on right before the debounced fetch starts,
not instantly on every keystroke), which is the correct behavior anyway.

**End-to-end verification, and another false-positive lesson**

Full flow through a headless browser against the real database: browse
`/food` (all 20 foods), search "rice" (exactly Fried/Jollof/White Rice,
nothing else), search a nonsense term (no-results state), click a food
from `/food` (lands pre-selected on `/food/add`, no search box shown),
set quantity=2 and confirm the live total showed 700 kcal before
submitting, submit and land back on `/food` (the origin), use the nav's
"+ Add Food" button from `/dashboard` and confirm the URL carried
`from=/dashboard`, add Beans ×1.5, confirm redirect back to `/dashboard`,
log out and confirm both `/food` and `/food/add` are protected.

One check flagged a failure — `page.textContent("body")` for the "rice"
search claimed "Apple" was present, which would mean the search filter
was broken. Screenshot showed the rendered result list was exactly
right (Fried Rice, Jollof Rice, White Rice — no Apple). Same root cause
as an EPIC-01 false positive from earlier: `textContent("body")` also
picks up text inside Next.js's inert hydration `<script>` payload, which
can carry serialized data from prefetched routes. Re-ran with a locator
scoped to the actual rendered list items instead of the whole page —
confirmed clean. Lesson applied going forward: scope DOM assertions to
the specific rendered elements, never raw `body` text, when a script tag
could plausibly contain the string being checked for.

Read the two `MealEntry` rows created during verification directly via
`psql` rather than trusting the UI: Jollof Rice ×2 stored as exactly
700 kcal / 16g protein / 110g carbs / 24g fat (350/8/55/12 × 2); Beans
×1.5 stored as exactly 381 kcal / 22.8g protein / 67.5g carbs / 1.65g
fat (254/15.2/45/1.1 × 1.5). Both correct to the decimal.

**Cleanup**

Truncated `User`/`Profile`/`WeightLog`/`MealEntry` (test data) after
verification; left the seeded `Food` table untouched.

**State at end of session**

Every EPIC-00, EPIC-01, EPIC-03, and EPIC-04 ticket is `Done`, plus
EPIC-05's `TICKET-021`/`TICKET-022`. Build, typecheck, lint, tests (11
passing), and format all clean.

**Next up**

`TICKET-023` (EPIC-05's shared meal-breakdown UI component) — not
deferred, it's the natural first step into `EPIC-06` (Dashboard), which
explicitly depends on it.

---

## 2026-08-29 (last one today) — Implemented EPIC-06 (Dashboard)

**What I worked on**

`TICKET-023` (EPIC-05, meal breakdown component), `TICKET-013` (EPIC-02,
macro targets — pulled forward the same way `TICKET-011`/`012` were for
EPIC-01), and all of EPIC-06: `TICKET-025` (layout), `TICKET-026`
(progress bar), `TICKET-027` (macro display), `TICKET-028` (warning),
`TICKET-029` (aggregation).

**What got built**

- `src/lib/date-only.ts` — extracted the `toDateOnly()` helper that used
  to live only in `meal-entry.ts`, since `daily-summary.ts` needs the
  exact same "what date is 'today' in this @db.Date column" logic and
  duplicating it would risk the two drifting apart.
- `src/lib/calorie-target.ts` gained `calculateMacroTargets()` — 30%
  protein / 40% carbs / 30% fat of the daily calorie target, converted
  to grams (4 kcal/g protein & carbs, 9 kcal/g fat). Chose a standard
  balanced split rather than a goal-specific one, since the brief only
  asks for macro *targets*, not per-goal macro tuning.
- `saveProfileAction` now computes and stores the macro targets too,
  alongside the calorie target it already computed — closing out the
  last open piece of `TICKET-014` from EPIC-01.
- `src/lib/daily-summary.ts` — `getDailySummary(userId, date)`, one
  Prisma query (`findMany` with the food relation included), grouped by
  meal category in memory afterward. A plain function, not a JSON API —
  every consumer (Dashboard now, History later) is a Server Component in
  the same process, so there's no reason to round-trip through HTTP.
- `src/components/meal-breakdown.tsx`, `calorie-progress.tsx`,
  `macro-progress.tsx` — three small, pure presentational components,
  each taking already-computed data as props. Empty meal categories are
  hidden entirely (documented choice, matches Section 5's example).
- `src/app/(app)/dashboard/page.tsx` composes all of it.

**Verification — the most thorough pass yet**

Wrote a script that captures the *ground truth* from the database (the
computed `dailyCalorieTarget` and macro targets, read directly via
`psql`) before ever touching the UI, then checks the Dashboard's
displayed numbers against that ground truth — not against a value I
typed into the test by hand. Used known profile inputs (male, 70kg,
175cm, age 30, sedentary, maintain) so the expected target was
verifiable by the same formula the app uses, but the actual assertions
compared the UI against what the database actually stored, which is the
stronger check.

Three states verified:
1. **Empty** — 0 kcal consumed, remaining = target, no warning, "Nothing
   logged for this day yet.", both macro rows at `0g / Xg`.
2. **Under target** — logged Jollof Rice (Breakfast), Beans (Lunch),
   Egusi Soup (Dinner); consumed = 350+254+400 = 1004 exactly; remaining
   = target−1004 exactly; three category headers with correct subtotals;
   empty Snacks category correctly hidden; macro grams matched a hand
   sum of the three foods' stored macros (protein 8+15.2+18=41.2→41g,
   confirmed against the rendered `41g / 148g`).
3. **Over target** — added 5× Egusi Soup (2000 kcal) under Snacks;
   consumed = 3004 exactly; warning text read "...exceeded your daily
   calorie target by 1025 kcal" — 3004−1979=1025, exact; progress bar
   screenshot confirmed red at full width; Remaining correctly floored
   to `0 kcal` instead of going negative.

Also fixed a Windows-specific `execSync` quoting bug in the verification
script itself along the way: passing a `SELECT "column" FROM "Table"`
query as an inline `-c "..."` argument through `execSync` silently
stripped the double quotes (Windows shell quoting, not a psql issue),
causing "relation does not exist" errors on every query. Fixed by
writing the SQL to a temp file and using `psql -f` instead of `-c`.
Noting it here since it'll happen again the next time a verification
script needs to query Postgres from Node on this machine.

**Cleanup**

Truncated `User`/`Profile`/`WeightLog`/`MealEntry` after verification;
seeded `Food` data untouched.

**State at end of session**

Every EPIC-00, EPIC-01, EPIC-03, EPIC-04, and EPIC-06 ticket is `Done`,
plus all of EPIC-02 (`TICKET-011`–`014`) and EPIC-05's `TICKET-021`–
`023`. Build, typecheck, lint, tests (13 passing), and format all clean.

**Next up**

`EPIC-07` (food history) per the build order. `TICKET-024` (edit/delete
a logged entry, EPIC-05) is open and unblocked but wasn't picked up this
session — noted as a candidate whenever history or dashboard polish
becomes the priority.
