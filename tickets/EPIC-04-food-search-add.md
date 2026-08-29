# EPIC-04 — Food Search & Add Food

Source: Requirements Section 4 (Add Food) and Section 12 (prominent
"+ Add Food" button and the standalone "Food" nav section).

> **Build-order note:** `TICKET-019` depends on `TICKET-021` (meal entry
> data model) from EPIC-05, numbered later. Build `TICKET-021` before
> `TICKET-019` despite the epic order — see `INDEX.md`'s "Cross-epic
> build-order exceptions." `TICKET-021` turned out to already be done —
> it was migrated as part of EPIC-00's schema skeleton — so this epic
> only needed to add `TICKET-022` (the write action TICKET-019 calls) on
> top, not the whole rest of EPIC-05.
>
> **Design note:** Implemented "Add Food" as a dedicated page
> (`/food/add`) rather than a floating modal. The ticket language says
> "flow" and "opens," not "modal" specifically, and a page-based flow
> with a `from` query param for return-navigation is simpler to build,
> test, and verify (ordinary page navigation, no overlay/portal state to
> manage) while satisfying every acceptance criterion below exactly the
> same way from the user's perspective.
>
> **Scope note on TICKET-019's date-context criterion:** the mechanism
> (accepting an optional `?date=` param, defaulting to today) is fully
> implemented and works end-to-end. What's *not* built yet is a caller
> that passes a non-today date — that's the History page (EPIC-07),
> which is still a placeholder. Verified today's-date behavior directly;
> the past-date path will get its first real exercise once EPIC-07 wires
> its "+ Add Food" links with `&date=`.

---

## TICKET-018: Food search (UI + API)

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-017

### Description
Type-ahead search over the food database by name, per Section 4's
example list (Rice, Beans, Chicken, Egg, Bread, Yam, Banana, Apple,
Jollof Rice).

API: extended `GET /api/foods` with an optional `q` param (case-
insensitive `contains` match on name) rather than a separate endpoint —
a natural extension of TICKET-017's existing list endpoint. UI:
`src/components/forms/food-search.tsx`, a single reusable component
shared with TICKET-046's browse page (an empty query returns the first
page alphabetically, so the same component doubles as "browse" and
"search").

### Acceptance Criteria
- [x] Search input filters foods by name (case-insensitive, partial
      match) — Postgres `mode: "insensitive"` via Prisma
- [x] Results show name + calories-per-serving at a glance (plus
      category and serving size)
- [x] No-results state handled (food not in database)
- [x] Search debounced (300ms) so every keystroke doesn't hit the API
- [x] **Verified against a real database:** searched "rice" and
      confirmed exactly Fried Rice, Jollof Rice, and White Rice were
      returned (not, say, Apple or anything else) via a locator scoped
      to the rendered result list — not a raw page-text check, which
      gave a false positive from inert Next.js hydration script content
      the first time (see `journal.md`'s entry for that day); searched a
      nonsense term and confirmed the "No foods found" state rendered

---

## TICKET-019: Add Food flow — quantity/serving → total calories

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-018, TICKET-021

### Description
After selecting a food from search, let the user enter a quantity and
compute the total, per Section 4's example ("Jollof Rice, 1 serving =
350 kcal, Quantity = 2, Total = 700 kcal"), then log it to a meal
category. Also covers TICKET-022's write path — see this epic's top note
on why they were built together.

`src/app/(app)/food/add/page.tsx` (server component, resolves an
optional `?foodId=` to a pre-selected food) +
`src/components/forms/add-food-form.tsx` (client component: search phase
if no food selected yet, quantity/meal-category phase once one is).
Submits via `logMealEntryAction` (`src/lib/actions/meal-entry.ts`),
which snapshots `calories`/`proteinG`/`carbsG`/`fatG` onto the
`MealEntry` row at write time — never recomputed from live `Food` data
later, per the schema's own comment on why.

### Acceptance Criteria
- [x] Selecting a food shows its per-serving calories and macros
- [x] Quantity input (numeric, supports fractional servings e.g. 1.5;
      `step="any"` so it's not restricted to quarter-serving increments)
- [x] Total calories/macros computed live as quantity changes
      (serving value × quantity)
- [x] User selects a meal category (Breakfast/Lunch/Dinner/Snacks)
      before confirming
- [x] Confirming creates a `MealEntry` (server-side; food re-fetched and
      re-checked for `isArchived` at submit time, not trusted from the
      client) and redirects back to the originating page
- [x] The flow logs to a target date, not always "today": the mechanism
      (`?date=` param, defaulting to today) is fully implemented — see
      this epic's top note on why the past-date path is unverified
      (no caller yet; that's EPIC-07)
- [x] **Verified against a real database:** added Jollof Rice ×2 and
      confirmed the created `MealEntry` row was exactly 700 kcal / 16g
      protein / 110g carbs / 24g fat (350/8/55/12 × 2); added Beans ×1.5
      and confirmed 381 kcal / 22.8g protein / 67.5g carbs / 1.65g fat
      (254/15.2/45/1.1 × 1.5) — both read directly from the database via
      `psql`, not just trusted from the UI

---

## TICKET-020: Global "+ Add Food" entry point

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-005, TICKET-019

### Description
Wire the "+ Add Food" button from the app shell (TICKET-005) to open the
search → add flow (TICKET-018/019) from anywhere in the app, matching
Section 12's requirement that it be prominent and always available.

`MainNav` (already rendering the button on every `(app)` page since
EPIC-00) now builds its href as `/food/add?from=<current pathname>` via
`usePathname()`, so `logMealEntryAction` knows where to redirect back to
on success.

### Acceptance Criteria
- [x] Button visible and functional from Dashboard, Food, History,
      Progress, and Profile pages — it's in the shared `(app)` layout's
      header, so this was already true structurally; verified live from
      Dashboard
- [x] Opens the same Add Food flow regardless of originating page
- [x] After adding, user returns to the page they started from (not
      forced to Dashboard) — verified: launched from `/dashboard`,
      landed back on `/dashboard` after submit; launched from `/food`
      (via a food card, not the nav button), landed back on `/food`.
      "Totals refreshed if visible on that page" has nothing to verify
      yet — Dashboard/History don't render any totals until EPIC-06/07
      exist; once they're server components reading fresh data on every
      navigation, this is automatic, not something to build separately
- [x] Launched from Dashboard/Food/Progress/Profile, the flow logs to
      today (verified); launched from History for a past date, it would
      log to that date via the same `?date=` mechanism TICKET-019
      implements — unverified end-to-end since History doesn't exist yet

---

## TICKET-046: Food page — browsable/searchable database view

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-018

### Description
Section 12 lists "Food" as one of the five main navigation sections,
distinct from the "+ Add Food" button. Without this ticket, "Food" in the
nav (scaffolded as an empty placeholder route by TICKET-005) has no
defined content — the search/add capability built in TICKET-018/019 only
exists inside the Add Food flow, with no standalone page. This ticket
gives the nav item real content: a browsable, searchable view of the
food database.

`src/app/(app)/food/page.tsx` + `src/components/forms/food-browser.tsx`
— reuses TICKET-018's `FoodSearch` component directly, with an
`onSelect` that navigates (`router.push`) to
`/food/add?foodId=<id>&from=/food` instead of setting local state, which
is what makes the same underlying component behave as "search-then-log"
in the Add Food flow and "browse-then-navigate" here.

### Acceptance Criteria
- [x] `/food` page lists foods from the database (reuses TICKET-017/018's
      API), with the same search bar/behavior as TICKET-018
- [x] Each food shows name, category, calories-per-serving at a glance
- [x] Selecting a food from this page opens the Add Food flow
      (TICKET-019) with that food pre-selected, skipping the search step
      — verified: clicking Jollof Rice from `/food` landed on
      `/food/add` with Jollof Rice already shown and no search input
      present
- [x] Archived foods (TICKET-015's `isArchived`) are excluded, consistent
      with TICKET-017 — inherited automatically from the shared API/
      component, nothing extra needed here
- [x] This page is a browse/discovery surface only — it does not
      duplicate the quantity-entry or meal-category-selection UI, both of
      which stay owned by TICKET-019
