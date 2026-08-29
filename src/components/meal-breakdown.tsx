import type { MealBreakdownGroup } from "@/lib/daily-summary";
import { MealEntryRow } from "./meal-entry-row";

// TICKET-023: shared by Dashboard (today) and History (any date) —
// takes already-aggregated data from getDailySummary() as props.
// `returnPath` tells each entry's edit/delete action (TICKET-024) which
// page to revalidate after a mutation, since this component itself
// doesn't know where it's being rendered.
//
// Categories with no entries are hidden entirely rather than shown as
// "no items logged" — matches Section 5's example, which only lists
// categories that actually have something in them.
export function MealBreakdown({
  groups,
  returnPath,
}: {
  groups: MealBreakdownGroup[];
  returnPath: string;
}) {
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
          <ul className="mt-1 flex flex-col divide-y divide-neutral-100 text-sm text-neutral-600 dark:divide-neutral-800 dark:text-neutral-300">
            {group.entries.map((entry) => (
              <MealEntryRow
                key={entry.id}
                entry={entry}
                returnPath={returnPath}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
