# EPIC-06 — Dashboard & Daily Progress

Source: Requirements Section 3 (Dashboard) and Section 6 (Daily Calorie
Progress).

`src/app/(app)/dashboard/page.tsx` — a Server Component that calls
`requireProfile()`, `getDailySummary()` (TICKET-029), and composes the
`CalorieProgress` (TICKET-026), `MacroProgress` (TICKET-027), and
`MealBreakdown` (TICKET-023) components. All of EPIC-06 was built and
verified together in one pass, since the page only makes sense as a
whole — splitting the verification up would have meant re-deriving the
same test data five times.

---

## TICKET-025: Dashboard layout — Today's Summary

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-012, TICKET-013, TICKET-023, TICKET-029

### Description
Build the primary landing page after login, per Section 3's example:
```
Today's Summary
Daily Target: 2,000 kcal
Consumed: 1,350 kcal
Remaining: 650 kcal
Exercise: 200 kcal
```

### Acceptance Criteria
- [x] Shows Daily Target (TICKET-012), Consumed (TICKET-029), Remaining
      = Target − Consumed, floored at 0 for display (over-target is
      handled by TICKET-028's warning, not a negative Remaining number)
- [x] Exercise kcal is displayed as a fixed `0 kcal` for MVP — there is
      no exercise-logging feature (Section 14 defers it explicitly), so
      the Remaining calculation is Target − Consumed only, with no "+
      Exercise" term. The field stays visible so the layout matches
      Section 3's example and doesn't need reshaping when exercise
      tracking is added later — it just isn't wired to any input yet
- [x] Includes the meal breakdown component from TICKET-023 for today
- [x] Includes the "+ Add Food" entry point (TICKET-020) — already true
      structurally via the shared `(app)` layout's nav
- [x] **Verified against a real database:** onboarded a profile with
      known inputs (male, 70kg, 175cm, age 30, sedentary, maintain),
      read the resulting `dailyCalorieTarget` (1979) directly from the
      database, then confirmed the Dashboard displayed exactly that
      number with zero consumption in the empty state (`0 / 1979 kcal`,
      `1979 calories remaining`, "Nothing logged for this day yet.")

---

## TICKET-026: Calorie progress indicator (bar/circular)

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-025

### Description
Visual progress indicator for calorie consumption, per Section 3/6's
example ("1,350 / 2,000 kcal", "650 calories remaining").

`src/components/calorie-progress.tsx` — went with a bar over a circular
indicator: simpler to build correctly (a `<div>` with a `width` style, no
SVG arc-length math) and reads just as clearly at this size.

### Acceptance Criteria
- [x] Progress indicator (bar) shows consumed vs. target, width capped
      at 100% so it doesn't overflow its container when over target
- [x] Numeric label shows "`consumed` / `target` kcal" and remaining
      count (or "Over your daily target" instead of a remaining count
      when over)
- [x] Visually distinguishes "under target" (emerald) from "over target"
      (red) — feeds TICKET-028's warning
- [x] **Verified against a real database:** screenshotted both states —
      green bar at ~51% width when under target (1,004/1,979 kcal), red
      bar at full width when over (3,004/1,979 kcal)

---

## TICKET-027: Macronutrient progress display

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-025, TICKET-013

### Description
Section 3's macro display: `Protein: 75g / 120g`, `Carbohydrates: 150g /
250g`, `Fat: 45g / 65g`.

`src/components/macro-progress.tsx`. This ticket is what pulled
`TICKET-013` forward into this session — there was no macro data to
display without it.

### Acceptance Criteria
- [x] Shows consumed/target grams for protein, carbohydrates, fat
- [x] Values sum correctly from today's logged `MealEntry` rows —
      `getDailySummary()` (TICKET-029) sums the snapshot macro values
      already stored per entry
- [x] Targets come from TICKET-013 (`Profile.proteinTargetG` etc.)
- [x] **Verified against a real database:** for a profile with 148g/
      198g/66g targets, logged foods summing to known macro totals and
      confirmed the displayed consumed grams matched exactly (e.g. 41g
      protein after Jollof Rice + Beans + Egusi Soup, cross-checked by
      hand: 8+15.2+18=41.2→41g rounded)

---

## TICKET-028: Over-target warning message

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-026

### Description
Section 6: when consumed exceeds target, show a warning, e.g. "WARNING:
You have exceeded your daily calorie target by 150 kcal."

Inline on the Dashboard page itself (`role="alert"`, red-bordered card) —
not a separate component, since it's a few lines only used in one place.

### Acceptance Criteria
- [x] Warning appears only when consumed > target
- [x] Warning states the exact kcal amount over target
- [x] Warning is visually distinct (red border/background, bold
      "WARNING:") but not a blocking modal — just an inline card
- [x] **Verified against a real database:** consumed 3,004 kcal against
      a 1,979 kcal target and got exactly "WARNING: You have exceeded
      your daily calorie target by 1025 kcal." — matches 3004−1979=1025
      precisely

---

## TICKET-029: Daily consumption aggregation API

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-022

### Description
Backend aggregation: sum calories and macros from `MealEntry` rows for a
given user + date. This powers both the Dashboard (today) and History
(any selected date).

Implemented as `getDailySummary(userId, date)` in
`src/lib/daily-summary.ts` — a plain async function, not a JSON API
route. Both current and future consumers (Dashboard, and History once
EPIC-07 exists) are Server Components in the same Next.js process, so a
function call is simpler and faster than a fetch to a same-origin API
would be, with no loss of reusability.

### Acceptance Criteria
- [x] Accepts userId + date, returns total calories, total protein/
      carbs/fat, and entries grouped by meal category
- [x] Correct for a date with zero entries (returns zeros, not an
      error) — verified: a brand-new profile's Dashboard showed
      `0 kcal` consumed and all-zero macros, not a crash
- [x] Performance: single query (`findMany` with the `food` relation
      included), grouped in memory afterward — not N+1 per entry or
      per category
