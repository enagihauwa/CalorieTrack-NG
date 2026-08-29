# EPIC-09 — Weight Tracking

Source: Requirements Section 9 (Weight Tracking).

> **Build-order note:** EPIC-08's `TICKET-036` depends on this epic's
> `TICKET-039`. Prioritize `TICKET-037`/`TICKET-039` so EPIC-08 isn't
> blocked waiting on them — see `INDEX.md`'s "Cross-epic build-order
> exceptions."

---

## TICKET-037: Weight entry model + log-weight UI

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-003, TICKET-009

### Description
Let users record their weight periodically, per Section 9 ("Users should
be able to record their weight periodically"), and resolve where "Goal
Weight" (shown in Section 9's example) lives — Section 2's onboarding
profile only collects a goal *direction* (lose/maintain/gain), not a
numeric target, so it has no natural home there.

### Acceptance Criteria
- [ ] `WeightLog` model: userId (FK), weight, date
- [ ] UI form to log a new weight entry (weight + date, defaulting to
      today)
- [ ] Validation: realistic weight range, one entry per date (edit
      existing rather than duplicate if the user logs twice for the same
      day — documented choice)
- [ ] `Profile` gains an optional `goalWeight` field (nullable — not
      every user sets one). It is captured here, on the Weight Tracking
      page, not added to the Section 2 onboarding form (TICKET-008) —
      Section 9 presents Goal Weight as part of weight tracking, not
      part of the profile the app asks for at sign-up, and TICKET-008
      should not gain a field the brief doesn't list for it
- [ ] A "set/update goal weight" control exists on the Weight page,
      separate from logging a new weight entry

---

## TICKET-038: Weight history list

**Priority:** P2 · **Status:** Not Started · **Depends on:** TICKET-037

### Description
List past weight entries so users can review/correct them.

### Acceptance Criteria
- [ ] Chronological list of weight entries (most recent first)
- [ ] Entries editable/deletable

---

## TICKET-039: Weight progress chart

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-037

### Description
Section 9's example: "Starting Weight: 85 kg, Current Weight: 82 kg,
Goal Weight: 75 kg" with weight progress displayed over time.

### Acceptance Criteria
- [ ] Chart (Recharts) plots weight entries over time
- [ ] Displays starting weight (first logged entry, or profile weight at
      sign-up if no log exists yet), current weight (most recent entry),
      and goal weight
- [ ] Goal weight is read from `Profile.goalWeight` (TICKET-037). If the
      user hasn't set one, the goal weight line/value is omitted from the
      chart entirely — never inferred or guessed from the lose/maintain/
      gain direction
