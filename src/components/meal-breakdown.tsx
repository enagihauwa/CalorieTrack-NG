import type { MealBreakdownGroup } from "@/lib/daily-summary";

// TICKET-023: shared by Dashboard (today) and History (any date, once
// EPIC-07 exists) — pure presentational, takes already-aggregated data
// from getDailySummary() as props.
//
// Categories with no entries are hidden entirely rather than shown as
// "no items logged" — matches Section 5's example, which only lists
// categories that actually have something in them.
export function MealBreakdown({ groups }: { groups: MealBreakdownGroup[] }) {
  const nonEmpty = groups.filter((group) => group.entries.length > 0);

  if (nonEmpty.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Nothing logged for this day yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {nonEmpty.map((group) => (
        <div key={group.category}>
          <div className="flex items-baseline justify-between">
            <h3 className="font-semibold">{group.label}</h3>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {group.subtotalCalories} kcal
            </span>
          </div>
          <ul className="mt-1 flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-300">
            {group.entries.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between">
                <span>
                  {entry.quantity !== 1 ? `${entry.quantity}× ` : ""}
                  {entry.foodName}
                </span>
                <span>{entry.calories} kcal</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
