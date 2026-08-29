# EPIC-02 — Daily Calorie Target Calculation

Source: Requirements Section 2 ("The application can use this information
to estimate the user's daily calorie target"), Section 16 (calculated
right after onboarding). The brief doesn't name a formula — see the
"Important decisions" section of the root `README.md` for why Mifflin-St
Jeor was chosen.

> **Build-order note:** `TICKET-011`/`TICKET-012` were pulled forward and
> implemented during EPIC-01, because EPIC-01's `TICKET-008` (profile
> onboarding form) has an acceptance criterion that structurally requires
> a computed calorie target at save time — the same class of cross-epic
> dependency as the EPIC-04↔05 and EPIC-08↔09 exceptions in
> `tickets/INDEX.md`, just not caught until EPIC-01 was actually
> implemented. See `tickets/EPIC-01-auth-profile.md`'s top note and the
> `journal.md` 2026-08-29 entry.

---

## TICKET-011: BMR/TDEE calculation service

**Priority:** P0 · **Status:** Done (implemented during EPIC-01) · **Depends on:** TICKET-009

### Description
Implement Mifflin-St Jeor BMR calculation from age/gender/weight/height,
then scale to TDEE using an activity-level multiplier.

Implemented at `src/lib/calorie-target.ts` (`calculateBmr`,
`calculateTdee`), tested at `src/lib/calorie-target.test.ts`.

### Acceptance Criteria
- [x] BMR formula implemented per Mifflin-St Jeor (separate constant for
      male/female, per the `gender` field on Profile)
- [x] Activity level multiplier table defined for each of the fixed
      activity levels from TICKET-008: sedentary ×1.2, light ×1.375,
      moderate ×1.55, active ×1.725, very active ×1.9 — standard values
- [x] Pure function, unit-testable without a database or UI — no
      Prisma/React import anywhere in `calorie-target.ts`
- [x] Unit tests cover one case per gender and every activity level
      (parameterized with `it.each`)

---

## TICKET-012: Goal-based target adjustment (lose/maintain/gain)

**Priority:** P0 · **Status:** Done (implemented during EPIC-01) · **Depends on:** TICKET-011

### Description
Adjust TDEE from TICKET-011 by the user's stated goal to produce the
final daily calorie target shown on the Dashboard (Section 3's "Daily
Target: 2,000 kcal").

Implemented at `src/lib/calorie-target.ts` (`calculateDailyCalorieTarget`).

### Acceptance Criteria
- [x] Goal "maintain weight" → target = TDEE (no adjustment)
- [x] Goal "lose weight" → target = TDEE minus 500 kcal/day (standard
      default)
- [x] Goal "gain weight" → target = TDEE plus 500 kcal/day (standard
      default)
- [x] Result never goes below 1200 kcal/day (documented constant,
      `MIN_DAILY_CALORIE_TARGET`) — a widely cited safe floor for adult
      daily intake
- [x] Unit tests for all three goals, plus a test confirming the floor
      holds for a low-BMR/high-deficit combination

---

## TICKET-013: Macronutrient targets (protein/carbs/fat)

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-012

### Description
Section 3 shows macro targets alongside the calorie target (e.g.
"Protein: 75g / 120g"). Derive gram targets from the daily calorie target
using a defined macro split.

### Acceptance Criteria
- [ ] Macro split defined as documented percentages of total calories
      (e.g. protein/carb/fat ratio) — recorded here, not implicit in code
- [ ] Converts calorie share → grams using 4 kcal/g (protein, carbs) and
      9 kcal/g (fat)
- [ ] Unit tests confirm grams sum back to the calorie target within
      rounding tolerance

---

## TICKET-014: Recalculate target on profile update

**Priority:** P1 · **Status:** Calorie target done (via EPIC-01); macro portion blocked on TICKET-013 · **Depends on:** TICKET-012, TICKET-010

### Description
Wire TICKET-010 (profile edit) to re-run TICKET-011/012/013 whenever a
field that affects the calculation changes, so the Dashboard always
reflects the current profile.

`saveProfileAction` (`src/lib/actions/profile.ts`, built during EPIC-01)
recomputes `dailyCalorieTarget` unconditionally on every save — simpler
than diffing old vs. new field values, and observably identical, since
recomputing with unchanged inputs yields the same number. That already
satisfies this ticket's intent for the calorie target. Once TICKET-013
lands, the same action needs to compute and persist the macro targets
the same way — noted here so it isn't missed when that ticket is picked
up.

### Acceptance Criteria
- [x] Editing weight, height, age, gender, activity level, or goal
      recalculates and persists the new `dailyCalorieTarget`
- [x] Editing fields that don't affect the calculation (e.g. name) — no
      special-casing needed; recomputing with those inputs unchanged just
      reproduces the same target
- [x] Dashboard reflects the updated target immediately after save (the
      redirect to `/dashboard` happens after the `prisma.profile.upsert`
      completes, so the next read is always current) — not yet visually
      confirmed since the Dashboard itself is still `EPIC-06`'s
      placeholder, but the stored value is correct and available
- [ ] **Macro targets** (`proteinTargetG`/`carbsTargetG`/`fatTargetG`) are
      not yet computed at all — blocked on `TICKET-013`
