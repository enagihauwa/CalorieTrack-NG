import { describe, expect, it } from "vitest";
import {
  calculateBmr,
  calculateDailyCalorieTarget,
  calculateTdee,
} from "./calorie-target";

describe("calculateBmr", () => {
  it("computes BMR for a male", () => {
    // 10*70 + 6.25*175 - 5*30 + 5 = 700 + 1093.75 - 150 + 5 = 1648.75
    expect(
      calculateBmr({ gender: "MALE", weightKg: 70, heightCm: 175, age: 30 }),
    ).toBeCloseTo(1648.75);
  });

  it("computes BMR for a female", () => {
    // 10*60 + 6.25*165 - 5*25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
    expect(
      calculateBmr({ gender: "FEMALE", weightKg: 60, heightCm: 165, age: 25 }),
    ).toBeCloseTo(1345.25);
  });
});

describe("calculateTdee", () => {
  it.each([
    ["SEDENTARY", 1.2],
    ["LIGHT", 1.375],
    ["MODERATE", 1.55],
    ["ACTIVE", 1.725],
    ["VERY_ACTIVE", 1.9],
  ] as const)("scales BMR by the %s multiplier", (level, multiplier) => {
    expect(calculateTdee(1500, level)).toBeCloseTo(1500 * multiplier);
  });
});

describe("calculateDailyCalorieTarget", () => {
  const base = {
    gender: "MALE",
    weightKg: 80,
    heightCm: 180,
    age: 28,
    activityLevel: "MODERATE",
  } as const;

  it("applies no adjustment for MAINTAIN", () => {
    const tdee = calculateTdee(calculateBmr(base), base.activityLevel);
    expect(calculateDailyCalorieTarget({ ...base, goal: "MAINTAIN" })).toBe(
      Math.round(tdee),
    );
  });

  it("subtracts ~500 kcal for LOSE", () => {
    const tdee = calculateTdee(calculateBmr(base), base.activityLevel);
    expect(calculateDailyCalorieTarget({ ...base, goal: "LOSE" })).toBe(
      Math.round(tdee) - 500,
    );
  });

  it("adds ~500 kcal for GAIN", () => {
    const tdee = calculateTdee(calculateBmr(base), base.activityLevel);
    expect(calculateDailyCalorieTarget({ ...base, goal: "GAIN" })).toBe(
      Math.round(tdee) + 500,
    );
  });

  it("never returns below the safe minimum floor", () => {
    const target = calculateDailyCalorieTarget({
      gender: "FEMALE",
      weightKg: 40,
      heightCm: 150,
      age: 70,
      activityLevel: "SEDENTARY",
      goal: "LOSE",
    });
    expect(target).toBeGreaterThanOrEqual(1200);
  });
});
