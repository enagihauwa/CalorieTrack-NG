# EPIC-04 — Food Search & Add Food

Source: Requirements Section 4 (Add Food) and Section 12 (prominent
"+ Add Food" button and the standalone "Food" nav section).

> **Build-order note:** `TICKET-019` depends on `TICKET-021` (meal entry
> data model) from EPIC-05, numbered later. Build `TICKET-021` before
> `TICKET-019` despite the epic order — see `INDEX.md`'s "Cross-epic
> build-order exceptions."

---

## TICKET-018: Food search (UI + API)

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-017

### Description
Type-ahead search over the food database by name, per Section 4's
example list (Rice, Beans, Chicken, Egg, Bread, Yam, Banana, Apple,
Jollof Rice).

### Acceptance Criteria
- [ ] Search input filters foods by name (case-insensitive, partial
      match)
- [ ] Results show name + calories-per-serving at a glance
- [ ] No-results state handled (food not in database)
- [ ] Search debounced so every keystroke doesn't hit the API

---

## TICKET-019: Add Food flow — quantity/serving → total calories

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-018, TICKET-021

### Description
After selecting a food from search, let the user enter a quantity and
compute the total, per Section 4's example ("Jollof Rice, 1 serving =
350 kcal, Quantity = 2, Total = 700 kcal"), then log it to a meal
category (hands off to EPIC-05).

### Acceptance Criteria
- [ ] Selecting a food shows its per-serving calories and macros
- [ ] Quantity input (numeric, supports fractional servings e.g. 1.5)
- [ ] Total calories/macros computed live as quantity changes
      (serving value × quantity)
- [ ] User selects a meal category (Breakfast/Lunch/Dinner/Snacks)
      before confirming — see TICKET-021
- [ ] Confirming creates a `MealEntry` and updates the day's totals
- [ ] The flow logs to a target date, not always "today": it defaults to
      today when opened from Dashboard/Food/Progress/Profile, but when
      opened from the History page (TICKET-030/032) for a past date, it
      logs to that selected date instead. No manual date picker inside
      the Add Food flow itself — the date comes from launch context only,
      keeping the modal itself simple per the brief's Section 4 example

---

## TICKET-020: Global "+ Add Food" entry point

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-005, TICKET-019

### Description
Wire the "+ Add Food" button from the app shell (TICKET-005) to open the
search → add flow (TICKET-018/019) from anywhere in the app, matching
Section 12's requirement that it be prominent and always available.

### Acceptance Criteria
- [ ] Button visible and functional from Dashboard, Food, History,
      Progress, and Profile pages
- [ ] Opens the same Add Food flow regardless of originating page
- [ ] After adding, user returns to the page they started from (not
      forced to Dashboard) with totals refreshed if visible on that page
- [ ] Launched from Dashboard/Food/Progress/Profile, the flow logs to
      today; launched from History while viewing a past date, it logs to
      that date (see TICKET-019's date-context criterion) — the button's
      behavior is otherwise identical everywhere it appears

---

## TICKET-046: Food page — browsable/searchable database view

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-018

### Description
Section 12 lists "Food" as one of the five main navigation sections,
distinct from the "+ Add Food" button. Without this ticket, "Food" in the
nav (scaffolded as an empty placeholder route by TICKET-005) has no
defined content — the search/add capability built in TICKET-018/019 only
exists inside the Add Food modal, with no standalone page. This ticket
gives the nav item real content: a browsable, searchable view of the
food database.

### Acceptance Criteria
- [ ] `/food` page lists foods from the database (reuses TICKET-017's
      list endpoint), with the same search bar/behavior as TICKET-018
- [ ] Each food shows name, category, calories-per-serving at a glance
- [ ] Selecting a food from this page opens the Add Food flow
      (TICKET-019) with that food pre-selected, skipping the search step
- [ ] Archived foods (TICKET-015's `isArchived`) are excluded, consistent
      with TICKET-017
- [ ] This page is a browse/discovery surface only — it does not
      duplicate the quantity-entry or meal-category-selection UI, both of
      which stay owned by TICKET-019
