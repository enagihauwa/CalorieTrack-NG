import { requireProfile } from "@/lib/require-profile";
import { prisma } from "@/lib/prisma";
import { getWeeklyCalories } from "@/lib/weekly-summary";
import { toDateOnly } from "@/lib/date-only";
import { WeeklyCalorieChart } from "@/components/weekly-calorie-chart";
import { WeightChart } from "@/components/weight-chart";
import { WeightLogForm } from "@/components/weight-log-form";
import { GoalWeightForm } from "@/components/goal-weight-form";
import { WeightHistoryList } from "@/components/weight-history-list";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}

// TICKET-036: single page combining the weekly calorie chart, average
// daily calories, and weight progress (EPIC-09) — per Section 12's
// nav, "Progress" is one section, so weight tracking lives here rather
// than on a separate route.
export default async function ProgressPage() {
  const { session, profile } = await requireProfile();
  const today = toDateOnly();

  const [weeklyDays, weightLogs] = await Promise.all([
    getWeeklyCalories(session.user.id, today),
    prisma.weightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    }),
  ]);

  // TICKET-035: average over the same 7-day window as the chart —
  // simplest consistent choice, documented here since the ticket left
  // the window length open.
  const averageDailyCalories = Math.round(
    weeklyDays.reduce((sum, day) => sum + day.totalCalories, 0) /
      weeklyDays.length,
  );

  const weightPoints = weightLogs.map((log) => ({
    date: log.date.toISOString().slice(0, 10),
    weightKg: log.weightKg,
  }));
  const weightHistoryItems = weightLogs.map((log) => ({
    id: log.id,
    date: log.date.toISOString().slice(0, 10),
    weightKg: log.weightKg,
  }));

  // "Profile weight at sign-up" (TICKET-039) has no separate historical
  // field once a profile's been edited — Profile.weightKg always holds
  // the latest value. Used here as the honest fallback starting point
  // when there's no logged history yet, which is what the ticket's
  // intent actually needs.
  const startingWeightKg =
    weightLogs.length > 0 ? weightLogs[0].weightKg : profile.weightKg;
  const currentWeightKg =
    weightLogs.length > 0
      ? weightLogs[weightLogs.length - 1].weightKg
      : profile.weightKg;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <h1 className="text-xl font-semibold">Progress</h1>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Weekly Calories</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Average: {averageDailyCalories.toLocaleString()} kcal/day
          </p>
        </div>
        <WeeklyCalorieChart
          days={weeklyDays}
          dailyTarget={profile.dailyCalorieTarget ?? 0}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Weight</h2>

        <dl className="grid grid-cols-3 gap-4">
          <Stat label="Starting" value={`${startingWeightKg} kg`} />
          <Stat label="Current" value={`${currentWeightKg} kg`} />
          <Stat
            label="Goal"
            value={
              profile.goalWeightKg ? `${profile.goalWeightKg} kg` : "Not set"
            }
          />
        </dl>

        <WeightChart
          points={weightPoints}
          goalWeightKg={profile.goalWeightKg}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <WeightLogForm />
          <GoalWeightForm currentGoalWeightKg={profile.goalWeightKg} />
        </div>

        <div>
          <h3 className="mb-2 font-semibold">History</h3>
          <WeightHistoryList logs={weightHistoryItems} />
        </div>
      </section>
    </div>
  );
}
