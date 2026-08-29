# EPIC-07 — Food History

Source: Requirements Section 7 (Food History).

`src/app/(app)/history/page.tsx` reads `?date=YYYY-MM-DD` (default:
today), reuses `getDailySummary()` (TICKET-029) and `MealBreakdown`
(TICKET-023) exactly as the Dashboard does. Building this also pulled
in `TICKET-024` (EPIC-05, edit/delete) — a past-day correction is
explicitly called out in TICKET-031's own acceptance criteria, so it
wasn't optional.

---

## TICKET-030: History page with date navigation

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-005

### Description
Let users pick a past date to review, per Section 7 ("Users should be
able to select different dates to view their previous records").

`src/components/history-date-nav.tsx` — prev/next-day buttons plus a
native `<input type="date">`, both driving the same `?date=` URL param.

### Acceptance Criteria
- [x] Date picker (native date input) **and** prev/next-day navigation
      control — built both since together they cost little more than
      one and cover more use cases
- [x] Cannot navigate to a future date beyond today — enforced three
      ways: the date input's `max` attribute, the "Next" button disabled
      on today, and a server-side clamp in the page itself for a
      hand-edited URL
- [x] Selected date is reflected in the URL (`?date=...`) so it survives
      a refresh
- [x] **Verified against a real database:** clicked "Previous day" and
      confirmed the URL updated to yesterday's date and the "Next"
      button was enabled again; manually requested a date 5 days in the
      future via the URL and confirmed the page clamped to today instead
      of honoring it

---

## TICKET-031: Fetch & display meals/totals for selected date

**Priority:** P0 · **Status:** Done · **Depends on:** TICKET-030, TICKET-029, TICKET-023, TICKET-024

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
- [x] Selected date's meal breakdown renders via the shared component
      from TICKET-023
- [x] Day total shown ("Total: X kcal"), matching `summary.totalCalories`
      — the same value the category subtotals sum to, since both come
      from the same `getDailySummary()` call
- [x] Entries from history are editable/deletable via TICKET-024 — the
      same `MealEntryRow` component Dashboard uses, just with
      `returnPath` set to `/history?date=<selected date>` instead of
      `/dashboard`, so an edit/delete on a past day redirects nowhere
      and simply re-renders that same historical date
- [x] **Verified against a real database:** History defaulting to today
      showed the exact same total (254 kcal) and entry as the Dashboard
      for a Beans entry logged moments earlier — confirming both pages
      genuinely share the same aggregation, not two separate
      implementations that happen to agree

---

## TICKET-032: Empty state for days with no logs

**Priority:** P2 · **Status:** Done · **Depends on:** TICKET-031, TICKET-019

### Description
A selected past date with nothing logged shouldn't look broken.

This ticket is also what finally exercised TICKET-019's date-context
mechanism for real — every prior test of Add Food used the default
"today" path, since nothing before this called it with a past date.

### Acceptance Criteria
- [x] Clear "nothing logged on this day" message instead of a blank/
      zeroed layout
- [x] Still offers the "+ Add Food" entry point so the user can backfill
      that date — launching Add Food from here logs to the viewed date,
      not today, so this is a fully working action, not a display-only
      placeholder
- [x] **Verified against a real database, end-to-end:** navigated to a
      day with nothing logged, confirmed the empty-state message and Add
      Food link; clicked it, confirmed the URL carried the viewed date
      (not today's); logged Egusi Soup through it; confirmed the
      resulting `MealEntry.date` in the database was exactly the
      backfilled date (not today) via a direct `psql` read — not just a
      UI check, the actual stored row; confirmed the entry appeared
      correctly back on that historical date's History view; confirmed
      today's own History view was unaffected (no leakage between dates)
