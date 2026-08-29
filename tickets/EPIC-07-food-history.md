# EPIC-07 — Food History

Source: Requirements Section 7 (Food History).

---

## TICKET-030: History page with date navigation

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-005

### Description
Let users pick a past date to review, per Section 7 ("Users should be
able to select different dates to view their previous records").

### Acceptance Criteria
- [ ] Date picker or prev/next-day navigation control
- [ ] Cannot navigate to a future date beyond today
- [ ] Selected date is reflected in the URL/state so it survives a
      refresh (not required to be shareable, just not lost on reload)

---

## TICKET-031: Fetch & display meals/totals for selected date

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-030, TICKET-029, TICKET-023, TICKET-024

### Description
Render the selected date's log using the same aggregation
(TICKET-029) and meal-breakdown component (TICKET-023) used on the
Dashboard, per Section 7's example:
```
August 28
Breakfast – 450 kcal
Lunch – 700 kcal
Dinner – 550 kcal
Snacks – 200 kcal
Total: 1,900 kcal
```

### Acceptance Criteria
- [ ] Selected date's meal breakdown renders via the shared component
      from TICKET-023
- [ ] Day total shown, matching the sum of category subtotals
- [ ] Entries from history are editable/deletable via TICKET-024 (a
      past-day correction is a normal use case, not just today's log)

---

## TICKET-032: Empty state for days with no logs

**Priority:** P2 · **Status:** Not Started · **Depends on:** TICKET-031, TICKET-019

### Description
A selected past date with nothing logged shouldn't look broken.

### Acceptance Criteria
- [ ] Clear "nothing logged on this day" message instead of a blank/
      zeroed layout
- [ ] Still offers the "+ Add Food" entry point so the user can backfill
      that date — per TICKET-019's date-context criterion, launching Add
      Food from History logs to the viewed date, not today, so this is a
      fully working action here, not a display-only placeholder
