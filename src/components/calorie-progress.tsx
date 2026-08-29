// TICKET-026: bar-style progress indicator. Color switches at the
// target boundary — feeds TICKET-028's warning, which handles the
// actual over-target message; this component only needs to look
// different, not explain why.
export function CalorieProgress({
  consumed,
  target,
}: {
  consumed: number;
  target: number;
}) {
  const isOver = consumed > target;
  const remaining = Math.max(0, target - consumed);
  const percent = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className={`h-full rounded-full transition-[width] ${isOver ? "bg-red-600" : "bg-emerald-600"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-lg font-semibold">
        {consumed.toLocaleString()} / {target.toLocaleString()} kcal
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {isOver
          ? "Over your daily target"
          : `${remaining.toLocaleString()} calories remaining`}
      </p>
    </div>
  );
}
