import Link from "next/link";
import { requireProfile } from "@/lib/require-profile";
import { getDailySummary } from "@/lib/daily-summary";
import { toDateOnly } from "@/lib/date-only";
import { MealBreakdown } from "@/components/meal-breakdown";
import { HistoryDateNav } from "@/components/history-date-nav";

function toISODateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { session } = await requireProfile();
  const params = await searchParams;

  const today = toDateOnly();
  const todayStr = toISODateString(today);

  let selectedDate =
    params.date && ISO_DATE_PATTERN.test(params.date)
      ? toDateOnly(params.date)
      : today;
  // TICKET-030: "cannot navigate to a future date" — the date input's
  // `max` and the disabled "Next" button handle this client-side; this
  // is the server-side backstop in case someone hand-edits the URL.
  if (selectedDate > today) {
    selectedDate = today;
  }
  const selectedStr = toISODateString(selectedDate);
  const returnPath = `/history?date=${selectedStr}`;

  const summary = await getDailySummary(session.user.id, selectedDate);
  const hasEntries = summary.groups.some((group) => group.entries.length > 0);

  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year:
      selectedDate.getUTCFullYear() !== today.getUTCFullYear()
        ? "numeric"
        : undefined,
  }).format(selectedDate);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">History</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {dateLabel}
          </p>
        </div>
        <HistoryDateNav date={selectedStr} todayStr={todayStr} />
      </div>

      {hasEntries ? (
        <>
          <p className="text-lg font-semibold">
            Total: {summary.totalCalories.toLocaleString()} kcal
          </p>
          <MealBreakdown groups={summary.groups} returnPath={returnPath} />
        </>
      ) : (
        // TICKET-032: empty state, with a working Add Food link that
        // backfills the viewed date (not today) — the first real caller
        // of TICKET-019's date-context mechanism.
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-neutral-500 dark:text-neutral-400">
            Nothing logged on this day.
          </p>
          <Link
            href={`/food/add?from=${encodeURIComponent(returnPath)}&date=${selectedStr}`}
            className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Add Food
          </Link>
        </div>
      )}
    </div>
  );
}
