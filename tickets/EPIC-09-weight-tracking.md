# EPIC-09 — Weight Tracking

Source: Requirements Section 9 (Weight Tracking).

> **Build-order note:** EPIC-08's `TICKET-036` depends on this epic's
> `TICKET-039`. Prioritize `TICKET-037`/`TICKET-039` so EPIC-08 isn't
> blocked waiting on them — see `INDEX.md`'s "Cross-epic build-order
> exceptions." Both were built together with all of EPIC-08 in one pass,
> since `TICKET-036` composes everything from both epics onto a single
> `/progress` page — there was no meaningful way to build one half
> without the other.
>
> **Where this actually lives:** `WeightLog` and `Profile.goalWeightKg`
> were already migrated as part of EPIC-00's schema skeleton — no new
> migration needed here. Per `TICKET-036`'s resolution, weight tracking
> UI (log form, goal form, chart, history) lives on `/progress` itself
> rather than a separate route, since Section 12's nav has one
> "Progress" entry, not a distinct "Weight" section.

---

## TICKET-037: Weight entry model + log-weight UI

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-003, TICKET-009

### Description
Let users record their weight periodically, per Section 9 ("Users should
be able to record their weight periodically"), and resolve where "Goal
Weight" (shown in Section 9's example) lives — Section 2's onboarding
profile only collects a goal *direction* (lose/maintain/gain), not a
numeric target, so it has no natural home there.

`src/lib/actions/weight.ts`'s `logWeightAction` + `setGoalWeightAction`,
UI at `src/components/weight-log-form.tsx` /
`src/components/goal-weight-form.tsx`, both rendered on `/progress`.

### Acceptance Criteria
- [x] `WeightLog` model: userId (FK), weight, date — already migrated as
      part of EPIC-00's schema skeleton
- [x] UI form to log a new weight entry (weight + date, defaulting to
      today, `max` capped at today)
- [x] Validation: realistic weight range (20–400kg), one entry per date
      — implemented as a Prisma `upsert` on the `(userId, date)` unique
      constraint, so logging twice for the same day edits the existing
      row instead of duplicating it
- [x] `Profile.goalWeightKg` — already migrated as part of EPIC-00's
      schema skeleton, nullable. Captured here, on `/progress`, not
      added to the Section 2 onboarding form (`TICKET-008`)
- [x] A "set/update goal weight" control exists, separate from logging a
      new weight entry — its own form, its own action, only ever touches
      `Profile.goalWeightKg`
- [x] **Verified against a real database:** logged 75kg for today,
      confirmed it appeared immediately as both "Starting" and "Current"
      (only entry so far); set a goal of 70kg and confirmed
      `Profile.goalWeightKg` in the database read back exactly `70`

---

## TICKET-038: Weight history list

**Priority:** P2 · **Status:** Done · **Depends on:** TICKET-037

### Description
List past weight entries so users can review/correct them.

`src/components/weight-history-list.tsx` + `weight-log-row.tsx` — same
inline-edit/delete pattern as `MealEntryRow` (EPIC-05's `TICKET-024`).
Edit reuses `logWeightAction` directly: since it's an upsert keyed on
`(userId, date)`, re-submitting the form for an existing date's entry
*is* the update, not a separate code path.

### Acceptance Criteria
- [x] Chronological list of weight entries (most recent first)
- [x] Entries editable/deletable, scoped to the owning user (delete
      re-fetches and checks `userId` before mutating, same as
      `TICKET-024`)
- [x] **Verified against a real database:** logged a second entry 7 days
      in the past, confirmed "Starting" (80kg, the earlier date) and
      "Current" (75kg, today) split correctly; edited the 75kg entry to
      74kg inline and confirmed the row collapsed back to view mode
      showing the new value (see the "bug found and fixed" note in
      `journal.md` — the row initially stayed stuck open after saving);
      deleted the 80kg entry and confirmed the database row count
      dropped from 2 to 1

---

## TICKET-039: Weight progress chart

**Priority:** P1 · **Status:** Done · **Depends on:** TICKET-037

### Description
Section 9's example: "Starting Weight: 85 kg, Current Weight: 82 kg,
Goal Weight: 75 kg" with weight progress displayed over time.

`src/components/weight-chart.tsx` — Recharts `LineChart`. "Profile
weight at sign-up" turned out not to be a distinct, preserved value once
a profile's been edited (`Profile.weightKg` always holds the *latest*
value; there's no separate historical snapshot) — used here as the
honest fallback starting point when no `WeightLog` rows exist yet, which
is what this criterion's intent actually needs, not a literal frozen
sign-up snapshot the schema was never designed to keep.

### Acceptance Criteria
- [x] Chart (Recharts `LineChart`) plots weight entries over time
- [x] Displays starting weight (first logged entry by date, or
      `profile.weightKg` if no log exists yet), current weight (most
      recent entry, or `profile.weightKg` as the same fallback), and
      goal weight
- [x] Goal weight is read from `Profile.goalWeightKg` (TICKET-037) and
      rendered as a `ReferenceLine`. If unset, the goal weight line/value
      is omitted entirely — never inferred or guessed from the
      lose/maintain/gain direction
- [x] **Verified against a real database:** with zero logs, both
      Starting and Current showed the profile's 80kg and the chart
      showed "No weight entries logged yet." (no crash on an empty
      series); after two logs (80kg a week ago, then 75kg today) the
      chart line and Starting/Current stats matched exactly; the goal
      reference line appeared only after a goal was explicitly set
