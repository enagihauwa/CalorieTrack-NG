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
