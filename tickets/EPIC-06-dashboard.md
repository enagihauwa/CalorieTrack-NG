# EPIC-06 — Dashboard & Daily Progress

Source: Requirements Section 3 (Dashboard) and Section 6 (Daily Calorie
Progress).

---

## TICKET-025: Dashboard layout — Today's Summary

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-012, TICKET-013, TICKET-023, TICKET-029

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
- [ ] Shows Daily Target (TICKET-012), Consumed (TICKET-029), Remaining
      = Target − Consumed, floored at 0 for display (over-target is
      handled by TICKET-028's warning, not a negative Remaining number)
- [ ] Exercise kcal is displayed as a fixed `0 kcal` for MVP — there is
      no exercise-logging feature (Section 14 defers it explicitly), so
      the Remaining calculation is Target − Consumed only, with no "+
      Exercise" term. The field stays visible so the layout matches
      Section 3's example and doesn't need reshaping when exercise
      tracking is added later — it just isn't wired to any input yet
- [ ] Includes the meal breakdown component from TICKET-023 for today
- [ ] Includes the "+ Add Food" entry point (TICKET-020)

---

## TICKET-026: Calorie progress indicator (bar/circular)

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-025

### Description
Visual progress indicator for calorie consumption, per Section 3/6's
example ("1,350 / 2,000 kcal", "650 calories remaining").

### Acceptance Criteria
- [ ] Progress indicator (bar or circular — implementer's choice, single
      consistent style) shows consumed vs. target
- [ ] Numeric label shows "`consumed` / `target` kcal" and remaining
      count
- [ ] Visually distinguishes "under target" from "over target" (e.g.
      color change) — feeds into TICKET-028

---

## TICKET-027: Macronutrient progress display

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-025, TICKET-013

### Description
Section 3's macro display: `Protein: 75g / 120g`, `Carbohydrates: 150g /
250g`, `Fat: 45g / 65g`.

### Acceptance Criteria
- [ ] Shows consumed/target grams for protein, carbohydrates, fat
- [ ] Values sum correctly from today's logged `MealEntry` rows
- [ ] Targets come from TICKET-013

---

## TICKET-028: Over-target warning message

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-026

### Description
Section 6: when consumed exceeds target, show a warning, e.g. "WARNING:
You have exceeded your daily calorie target by 150 kcal."

### Acceptance Criteria
- [ ] Warning appears only when consumed > target
- [ ] Warning states the exact kcal amount over target
- [ ] Warning is visually distinct (not just plain text — color/icon)
      but not a blocking modal

---

## TICKET-029: Daily consumption aggregation API

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-022

### Description
Backend aggregation: sum calories and macros from `MealEntry` rows for a
given user + date. This powers both the Dashboard (today) and History
(any selected date).

### Acceptance Criteria
- [ ] Endpoint/service accepts userId + date, returns total calories,
      total protein/carbs/fat, and entries grouped by meal category
- [ ] Correct for a date with zero entries (returns zeros, not an error)
- [ ] Performance: single query (or minimal queries) per request, not
      N+1 per entry
