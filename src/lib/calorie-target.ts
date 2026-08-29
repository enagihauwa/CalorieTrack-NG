import type { ActivityLevel, Gender, Goal } from "@prisma/client";

// TICKET-011/012 were pulled forward from EPIC-02 because TICKET-008
// (EPIC-01's profile onboarding form) requires a daily calorie target
// at save time — see tickets/INDEX.md's "Cross-epic build-order
// exceptions" and tickets/EPIC-01-auth-profile.md's TICKET-008 for why.
// TICKET-013 (macro targets) was added later, once EPIC-06's Dashboard
// (TICKET-027) needed it.

// Mifflin-St Jeor activity multipliers (standard values).
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

// Standard ~500 kcal/day deficit or surplus for a lose/gain goal.
const GOAL_ADJUSTMENT_KCAL: Record<Goal, number> = {
  LOSE: -500,
  MAINTAIN: 0,
  GAIN: 500,
};

// Never recommend below this, regardless of the calculation — a widely
// cited safe floor for adult daily calorie intake.
const MIN_DAILY_CALORIE_TARGET = 1200;

export function calculateBmr(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
}): number {
  const { gender, weightKg, heightCm, age } = params;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === "MALE" ? base + 5 : base - 161;
}

export function calculateTdee(
  bmr: number,
  activityLevel: ActivityLevel,
): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateDailyCalorieTarget(params: {
  gender: Gender;
  weightKg: number;
  heightCm: number;
  age: number;
  activityLevel: ActivityLevel;
  goal: Goal;
}): number {
  const bmr = calculateBmr(params);
  const tdee = calculateTdee(bmr, params.activityLevel);
  const adjusted = tdee + GOAL_ADJUSTMENT_KCAL[params.goal];
  return Math.max(MIN_DAILY_CALORIE_TARGET, Math.round(adjusted));
}

// TICKET-013: macro split as documented percentages of total calories —
// 30% protein / 40% carbohydrate / 30% fat, a standard balanced-diet
// default (not extreme, not goal-specific — the brief doesn't ask for
// per-goal macro tuning, just gram targets). 4 kcal/g for protein and
// carbs, 9 kcal/g for fat.
const MACRO_CALORIE_SHARE = {
  protein: 0.3,
  carbs: 0.4,
  fat: 0.3,
} as const;

const PROTEIN_CARBS_KCAL_PER_GRAM = 4;
const FAT_KCAL_PER_GRAM = 9;

export function calculateMacroTargets(dailyCalorieTarget: number): {
  proteinTargetG: number;
  carbsTargetG: number;
  fatTargetG: number;
} {
  return {
    proteinTargetG: Math.round(
      (dailyCalorieTarget * MACRO_CALORIE_SHARE.protein) /
        PROTEIN_CARBS_KCAL_PER_GRAM,
    ),
    carbsTargetG: Math.round(
      (dailyCalorieTarget * MACRO_CALORIE_SHARE.carbs) /
        PROTEIN_CARBS_KCAL_PER_GRAM,
    ),
    fatTargetG: Math.round(
      (dailyCalorieTarget * MACRO_CALORIE_SHARE.fat) / FAT_KCAL_PER_GRAM,
    ),
  };
}
