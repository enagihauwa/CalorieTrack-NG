import type { ActivityLevel, Gender, Goal } from "@prisma/client";

// Pulled forward from EPIC-02 (TICKET-011/012) because TICKET-008
// (EPIC-01's profile onboarding form) requires a daily calorie target
// at save time — see tickets/INDEX.md's "Cross-epic build-order
// exceptions" and tickets/EPIC-01-auth-profile.md's TICKET-008 for why.
// Macro-target computation (TICKET-013) is intentionally NOT included
// here; it's left for when EPIC-02 is formally implemented.

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
