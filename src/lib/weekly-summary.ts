import { prisma } from "@/lib/prisma";

export type WeeklyCaloriesDay = {
  date: string;
  label: string;
  totalCalories: number;
};

function toISODateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// TICKET-033: the last 7 days ending on `endDate` (inclusive), for the
// given user. One query for the whole window, grouped in memory by
// date — not seven separate per-day queries (that would be exactly the
// N+1 pattern TICKET-029 warns against, just at the weekly level).
export async function getWeeklyCalories(
  userId: string,
  endDate: Date,
): Promise<WeeklyCaloriesDay[]> {
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 6);

  const entries = await prisma.mealEntry.findMany({
    where: { userId, date: { gte: startDate, lte: endDate } },
    select: { date: true, calories: true },
  });

  const caloriesByDate = new Map<string, number>();
  for (const entry of entries) {
    const key = toISODateString(entry.date);
    caloriesByDate.set(key, (caloriesByDate.get(key) ?? 0) + entry.calories);
  }

  const days: WeeklyCaloriesDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(endDate);
    date.setUTCDate(date.getUTCDate() - i);
    const dateStr = toISODateString(date);
    days.push({
      date: dateStr,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        date,
      ),
      // TICKET-033: days with no entries return 0, not omitted.
      totalCalories: caloriesByDate.get(dateStr) ?? 0,
    });
  }

  return days;
}
