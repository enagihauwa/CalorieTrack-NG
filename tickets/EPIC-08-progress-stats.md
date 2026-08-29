# EPIC-08 — Progress & Statistics

Source: Requirements Section 8 (Progress and Statistics).

> **Build-order note:** `TICKET-036` depends on `TICKET-039` (weight
> progress chart) from EPIC-09, numbered later. Build `TICKET-037` and
> `TICKET-039` before closing out this epic — see `INDEX.md`'s
> "Cross-epic build-order exceptions."

---

## TICKET-033: Weekly calorie aggregation API

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-029

### Description
Aggregate daily totals across a 7-day window, per Section 8's example
(Monday–Friday calorie totals).

### Acceptance Criteria
- [ ] Endpoint/service returns per-day total calories for the last 7
      days (or a selected week) for the current user
- [ ] Days with no entries return 0, not omitted from the result set
- [ ] Reuses the per-day aggregation logic from TICKET-029 rather than
      duplicating the query

---

## TICKET-034: Weekly trend chart

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-033

### Description
Visualize the weekly data from TICKET-033, per Section 8: "A simple
chart can be used to visualize the information."

### Acceptance Criteria
- [ ] Bar or line chart (Recharts) showing calories per day for the week
- [ ] Daily target line/reference shown for comparison (nice-to-have,
      not blocking if it adds significant scope — note if deferred)
- [ ] Chart is legible on mobile width

---

## TICKET-035: Average daily calories stat

**Priority:** P2 · **Status:** Not Started · **Depends on:** TICKET-033

### Description
Section 8 lists "Average daily calories" as a stat to show.

### Acceptance Criteria
- [ ] Computed as mean of the same week's daily totals (or a longer
      window if the data model easily supports it — document choice)
- [ ] Displayed alongside the weekly chart

---

## TICKET-036: Progress page layout

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-034, TICKET-035, TICKET-039

### Description
Assemble the Progress section from Section 12's navigation, combining
weekly chart, average stat, and weight progress (TICKET-039) into one
page.

### Acceptance Criteria
- [ ] Single page combines: weekly calorie chart, average daily calories,
      weight trend
- [ ] Page reachable from main navigation as "Progress"
- [ ] Loads correctly for a new user with no history yet (empty/zero
      states, not errors)
