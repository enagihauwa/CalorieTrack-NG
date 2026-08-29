# EPIC-08 — Progress & Statistics

Source: Requirements Section 8 (Progress and Statistics).

> **Build-order note:** `TICKET-036` depends on `TICKET-039` (weight
> progress chart) from EPIC-09, numbered later. Build `TICKET-037` and
> `TICKET-039` before closing out this epic — see `INDEX.md`'s
> "Cross-epic build-order exceptions." Built all of both epics together
> in one pass, verified end-to-end against the real database — see
> `tickets/EPIC-09-weight-tracking.md` and `journal.md`.

---

## TICKET-033: Weekly calorie aggregation API

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-029

### Description
Aggregate daily totals across a 7-day window, per Section 8's example
(Monday–Friday calorie totals).

`src/lib/weekly-summary.ts`'s `getWeeklyCalories(userId, endDate)` — a
plain function like `getDailySummary()` (TICKET-029), not a JSON API,
for the same reason: every consumer is a Server Component in the same
process. "Reuses TICKET-029" is interpreted as reusing its *pattern*
(one query for the whole window, grouped in memory) rather than
literally calling `getDailySummary()` seven times, which would
reproduce exactly the N+1 query pattern TICKET-029 itself warns against
— just at the weekly level instead of the per-entry level.

### Acceptance Criteria
- [x] Returns per-day total calories for the last 7 days (ending today)
      for the current user
- [x] Days with no entries return 0, not omitted from the result set
- [x] Single query for the whole window (`findMany` with a date range),
      grouped by day in memory afterward — not seven separate per-day
      queries
- [x] **Verified against a real database:** logged one 350 kcal entry
      for today, confirmed the returned week's data showed exactly one
      non-zero day (today, 350 kcal) and six zero days, not six missing
      entries

---

## TICKET-034: Weekly trend chart

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-033

### Description
Visualize the weekly data from TICKET-033, per Section 8: "A simple
chart can be used to visualize the information."

`src/components/weekly-calorie-chart.tsx` — Recharts `BarChart`.

### Acceptance Criteria
- [x] Bar chart (Recharts) showing calories per day for the week
- [x] Daily target line/reference shown for comparison — built, not
      deferred; a `ReferenceLine` at `dailyTarget`, a few lines given
      Recharts was already in the mix
- [x] Chart is legible on mobile width — `ResponsiveContainer` at a
      fixed 224px height, abbreviated weekday labels ("Mon", "Tue", …)

---

## TICKET-035: Average daily calories stat

**Priority:** P2 · **Status:** Done · **Depends on:** TICKET-033

### Description
Section 8 lists "Average daily calories" as a stat to show.

### Acceptance Criteria
- [x] Computed as the mean of the same 7-day window as the chart —
      simplest consistent choice; documented in `/progress`'s page code
      rather than introducing a second, differently-sized window
- [x] Displayed alongside the weekly chart (top-right of that section)
- [x] **Verified against a real database:** logged 350 kcal on one day
      out of 7, confirmed the displayed average was exactly `50 kcal/day`
      (350 ÷ 7, including the six zero days in the average — not just
      averaging over days that had entries)

---

## TICKET-036: Progress page layout

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-034, TICKET-035, TICKET-039

### Description
Assemble the Progress section from Section 12's navigation, combining
weekly chart, average stat, and weight progress (TICKET-039) into one
page.

`src/app/(app)/progress/page.tsx` — one Server Component fetching both
the week's calories and all weight logs in parallel (`Promise.all`),
composing every EPIC-08/09 component onto a single route.

### Acceptance Criteria
- [x] Single page combines: weekly calorie chart, average daily
      calories, and the full weight section (chart, log form, goal form,
      history)
- [x] Page reachable from main navigation as "Progress" — verified live
- [x] Loads correctly for a new user with no history yet: verified all
      empty states at once for a freshly onboarded profile — zero-bar
      weekly chart, "Average: 0 kcal/day", Starting/Current both falling
      back to the profile's weight, Goal showing "Not set," "No weight
      entries logged yet." on the chart, "No weight entries yet." on the
      history list. No errors, no crashes.
