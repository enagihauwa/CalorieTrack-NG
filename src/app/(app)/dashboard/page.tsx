import { requireProfile } from "@/lib/require-profile";
import { getDailySummary } from "@/lib/daily-summary";
import { toDateOnly } from "@/lib/date-only";
import { CalorieProgress } from "@/components/calorie-progress";
import { MacroProgress } from "@/components/macro-progress";
import { MealBreakdown } from "@/components/meal-breakdown";

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="text-lg font-semibold">{value}</dd>
    </div>
  );
}

export default async function DashboardPage() {
  const { session, profile } = await requireProfile();
  const today = toDateOnly();
  const summary = await getDailySummary(session.user.id, today);

  const target = profile.dailyCalorieTarget ?? 0;
  const consumed = summary.totalCalories;
  const remaining = Math.max(0, target - consumed);
  const overBy = consumed > target ? consumed - target : 0;

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(today);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Today&apos;s Summary</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {todayLabel}
        </p>
      </div>

      <CalorieProgress consumed={consumed} target={target} />

      {overBy > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          <strong>WARNING:</strong> You have exceeded your daily calorie target
          by {overBy} kcal.
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Daily Target" value={`${target} kcal`} />
        <SummaryStat label="Consumed" value={`${consumed} kcal`} />
        <SummaryStat label="Remaining" value={`${remaining} kcal`} />
        <SummaryStat label="Exercise" value="0 kcal" />
      </dl>

      <MacroProgress
        consumed={{
          proteinG: summary.totalProteinG,
          carbsG: summary.totalCarbsG,
          fatG: summary.totalFatG,
        }}
        targets={{
          proteinTargetG: profile.proteinTargetG ?? 0,
          carbsTargetG: profile.carbsTargetG ?? 0,
          fatTargetG: profile.fatTargetG ?? 0,
        }}
      />

      <div>
        <h2 className="mb-2 text-lg font-semibold">Meals</h2>
        <MealBreakdown groups={summary.groups} returnPath="/dashboard" />
      </div>
    </div>
  );
}
