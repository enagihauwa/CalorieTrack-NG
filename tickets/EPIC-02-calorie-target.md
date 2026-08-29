# EPIC-02 — Daily Calorie Target Calculation

Source: Requirements Section 2 ("The application can use this information
to estimate the user's daily calorie target"), Section 16 (calculated
right after onboarding). The brief doesn't name a formula — see the
"Important decisions" section of the root `README.md` for why Mifflin-St
Jeor was chosen.

---

## TICKET-011: BMR/TDEE calculation service

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-009

### Description
Implement Mifflin-St Jeor BMR calculation from age/gender/weight/height,
then scale to TDEE using an activity-level multiplier.

### Acceptance Criteria
- [ ] BMR formula implemented per Mifflin-St Jeor (separate constant for
      male/female, per the `gender` field on Profile)
- [ ] Activity level multiplier table defined for each of the fixed
      activity levels from TICKET-008 (e.g. sedentary ×1.2 … very active
      ×1.9 — exact multipliers documented in code/comments, standard
      values)
- [ ] Pure function, unit-testable without a database or UI
- [ ] Unit tests cover at least one case per gender and one per activity
      level

---

## TICKET-012: Goal-based target adjustment (lose/maintain/gain)

**Priority:** P0 · **Status:** Not Started · **Depends on:** TICKET-011

### Description
Adjust TDEE from TICKET-011 by the user's stated goal to produce the
final daily calorie target shown on the Dashboard (Section 3's "Daily
Target: 2,000 kcal").

### Acceptance Criteria
- [ ] Goal "maintain weight" → target = TDEE (no adjustment)
- [ ] Goal "lose weight" → target = TDEE minus a defined deficit
      (documented, standard ~500 kcal/day default)
- [ ] Goal "gain weight" → target = TDEE plus a defined surplus
      (documented, standard ~500 kcal/day default)
- [ ] Result never goes below a safe minimum floor (documented constant)
- [ ] Unit tests for all three goals

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

**Priority:** P1 · **Status:** Not Started · **Depends on:** TICKET-012, TICKET-010

### Description
Wire TICKET-010 (profile edit) to re-run TICKET-011/012/013 whenever a
field that affects the calculation changes, so the Dashboard always
reflects the current profile.

### Acceptance Criteria
- [ ] Editing weight, height, age, gender, activity level, or goal
      recalculates and persists the new target
- [ ] Editing fields that don't affect the calculation (e.g. name) does
      not trigger recalculation
- [ ] Dashboard reflects the updated target immediately after save
