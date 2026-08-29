# EPIC-05 — Meal Categories & Daily Log

Source: Requirements Section 5 (Meal Categories).

> **Build-order note:** `TICKET-021` has no dependency on anything in
> EPIC-04, and EPIC-04's `TICKET-019` depends on it — so build
> `TICKET-021` first, before `TICKET-018`/`TICKET-019`, even though this
> epic is numbered after EPIC-04 in `INDEX.md`. The rest of this epic
> (`TICKET-022`–`024`) resumes after EPIC-04's Add Food flow exists,
> since `TICKET-022` depends back on `TICKET-019`.
>
> **Status:** `TICKET-021` and `TICKET-022` are done — `021` turned out
> to already be migrated as part of EPIC-00's schema skeleton, and `022`
> was built together with EPIC-04's `TICKET-019` (they're one unit of
> work: a form and the action it submits to).
>
> `TICKET-023` is also done now — built together with EPIC-06's
> Dashboard, its first real consumer. `TICKET-024` (edit/delete) is next
> — `MealBreakdown` has somewhere real to render entries now, so adding
> edit/delete actions to it is the natural next step, not blocked on
> anything.

---

## TICKET-021: Meal category model & food-entry association

**Priority:** P0 · **Status:** Done (built during EPIC-00) · **Depends on:** TICKET-003, TICKET-015

### Description
The `MealEntry` schema: links a user, a food, a quantity, a meal category
(Breakfast/Lunch/Dinner/Snacks), and a date.

### Acceptance Criteria
- [x] `MealEntry` model: userId (FK), foodId (FK), quantity, mealCategory
      (enum: Breakfast/Lunch/Dinner/Snacks), date, computed/stored
      calories+macros for that entry
- [x] One food can appear in multiple entries (e.g. logged twice in a
      day) without conflict — no unique constraint blocking it; confirmed
      indirectly since EPIC-04's verification logged two different foods
      without any collision, and nothing in the schema would prevent the
      same food twice
- [x] Migration applied cleanly — `prisma/migrations/20260829011450_init`

---

## TICKET-022: Log a food entry against a meal + date

**Priority:** P0 · **Status:** Done (built alongside TICKET-019, EPIC-04) · **Depends on:** TICKET-021, TICKET-019

### Description
The write path invoked by the Add Food flow (TICKET-019): persist a
`MealEntry` for today's date (or a selected date, if editing history).

Implemented as `logMealEntryAction` in `src/lib/actions/meal-entry.ts` —
built together with TICKET-019 rather than as a separate hand-off, since
in practice the Add Food form and the action it submits to are one unit
of work (same pattern as EPIC-01's profile form + its server action).

### Acceptance Criteria
- [x] Entry saved with correct userId, foodId, quantity, mealCategory,
      and date — date defaults to today, or is the specific past date
      passed in when the Add Food flow was launched from History
      (matches TICKET-019's date-context criterion; this action just
      accepts whatever date it's given, it doesn't decide it)
- [x] Calories/macros for the entry are computed and stored on the
      `MealEntry` row itself from food data × quantity at write time —
      not recomputed from live `Food` data on every read, so later admin
      edits to that food (TICKET-042) don't retroactively change this
      entry's historical total. Verified: read the created rows directly
      via `psql` and confirmed the stored calories/macros matched
      `food.value × quantity` exactly (Jollof Rice ×2 → 700/16/110/24;
      Beans ×1.5 → 381/22.8/67.5/1.65)
- [x] A Server Action, not a JSON API — no separate "return the created
      entry" step needed the way a REST endpoint would; the redirect
      after `redirect(safeRedirectTarget(...))` is itself the UI update
      (whatever page it lands back on re-renders with fresh server data)

---

## TICKET-023: Meal breakdown UI (grouped by category, subtotals)

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-022

### Description
Display logged entries grouped by meal category with subtotals, matching
Section 5's example:
```
Breakfast – 450 kcal
- 2 Eggs – 140 kcal
- Bread – 160 kcal
- Tea – 150 kcal
```

`src/components/meal-breakdown.tsx` — pure presentational, takes
already-aggregated data from `getDailySummary()` (TICKET-029,
`src/lib/daily-summary.ts`) as props. Built alongside EPIC-06's
Dashboard, its first consumer; History (EPIC-07) will be the second.

### Acceptance Criteria
- [x] Entries grouped under Breakfast/Lunch/Dinner/Snacks headers
- [x] Each group header shows its subtotal kcal
- [x] Each line item shows food name and its calorie contribution
      (quantity shown too when it isn't 1, e.g. "5× Egusi Soup")
- [x] Categories with no entries yet are hidden entirely (documented
      choice — matches Section 5's example, which only lists categories
      that actually have something logged)
- [x] Reused by both Dashboard (today) and History (selected date, once
      EPIC-07 builds it) — a plain function component taking `groups` as
      a prop, no page-specific logic inside it
- [x] **Verified against a real database:** logged Jollof Rice
      (Breakfast), Beans (Lunch), and Egusi Soup (Dinner), confirmed all
      three category headers and exact subtotals rendered, and that the
      empty Snacks category was hidden; then logged 5× Egusi Soup under
      Snacks and confirmed it appeared with the correct "5× Egusi Soup —
      2000 kcal" line and category subtotal

---

## TICKET-024: Edit / delete a logged food entry

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-023

### Description
Users make logging mistakes (wrong quantity, wrong meal, wrong food) —
they need to fix or remove an entry without deleting and re-adding
manually through search.

### Acceptance Criteria
- [ ] Each logged entry has edit and delete actions
- [ ] Editing quantity recomputes calories/macros for that entry
- [ ] Deleting removes the entry and updates daily totals immediately
- [ ] Edits/deletes are scoped to the owning user only
