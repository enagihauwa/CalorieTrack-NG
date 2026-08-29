import type { MealCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MEAL_CATEGORY_ORDER: MealCategory[] = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACKS",
];

const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks",
};

export type MealBreakdownEntry = {
  id: string;
  foodName: string;
  quantity: number;
  calories: number;
  mealCategory: MealCategory;
};

export type MealBreakdownGroup = {
  category: MealCategory;
  label: string;
  subtotalCalories: number;
  entries: MealBreakdownEntry[];
};

export type DailySummary = {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  groups: MealBreakdownGroup[];
};

// TICKET-029: powers both the Dashboard (today) and History (any
// selected date, once EPIC-07 exists) — one query, grouped in memory,
// not N+1 per meal category or per entry.
export async function getDailySummary(
  userId: string,
  date: Date,
): Promise<DailySummary> {
  const entries = await prisma.mealEntry.findMany({
    where: { userId, date },
    include: { food: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const groups: MealBreakdownGroup[] = MEAL_CATEGORY_ORDER.map((category) => {
    const categoryEntries = entries.filter(
      (entry) => entry.mealCategory === category,
    );
    return {
      category,
      label: MEAL_CATEGORY_LABELS[category],
      subtotalCalories: categoryEntries.reduce(
        (sum, entry) => sum + entry.calories,
        0,
      ),
      entries: categoryEntries.map((entry) => ({
        id: entry.id,
        foodName: entry.food.name,
        quantity: entry.quantity,
        calories: entry.calories,
        mealCategory: entry.mealCategory,
      })),
    };
  });

  return {
    totalCalories: entries.reduce((sum, entry) => sum + entry.calories, 0),
    totalProteinG: entries.reduce((sum, entry) => sum + entry.proteinG, 0),
    totalCarbsG: entries.reduce((sum, entry) => sum + entry.carbsG, 0),
    totalFatG: entries.reduce((sum, entry) => sum + entry.fatG, 0),
    groups,
  };
}
