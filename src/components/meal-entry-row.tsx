"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  updateMealEntryAction,
  deleteMealEntryAction,
} from "@/lib/actions/meal-entry";
import type { MealBreakdownEntry } from "@/lib/daily-summary";
import { inputClass } from "./forms/field";

const MEAL_CATEGORY_OPTIONS = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACKS", label: "Snacks" },
] as const;

// TICKET-024: edit (inline, quantity + meal category) and delete for a
// single logged entry. Owned by MealBreakdown (TICKET-023), which is
// shared by Dashboard and History — this component doesn't know or care
// which page it's rendered on, just where to send the browser back to
// (`returnPath`) after a mutation.
export function MealEntryRow({
  entry,
  returnPath,
}: {
  entry: MealBreakdownEntry;
  returnPath: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateMealEntryAction,
    undefined,
  );

  // Close the inline editor once a submit finishes without error. Without
  // this, a successful save that doesn't move the entry to a different
  // meal-category group (so the row isn't remounted) leaves the form
  // sitting open with stale values, even though the save worked.
  const wasPending = useRef(false);
  useEffect(() => {
    if (wasPending.current && !isPending && !state?.error) {
      setIsEditing(false);
    }
    wasPending.current = isPending;
  }, [isPending, state]);

  if (isEditing) {
    return (
      <li className="flex flex-wrap items-center gap-2 py-2">
        <form
          action={formAction}
          className="flex flex-1 flex-wrap items-center gap-2"
        >
          {state?.error && (
            <p
              role="alert"
              className="w-full text-xs text-red-600 dark:text-red-400"
            >
              {state.error}
            </p>
          )}
          <input type="hidden" name="entryId" value={entry.id} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <span className="flex-1 text-sm">{entry.foodName}</span>
          <input
            name="quantity"
            type="number"
            defaultValue={entry.quantity}
            min={0.25}
            max={50}
            step="any"
            className={`w-20 py-1 text-sm ${inputClass}`}
          />
          <select
            name="mealCategory"
            defaultValue={entry.mealCategory}
            className={`py-1 text-sm ${inputClass}`}
          >
            {MEAL_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isPending}
            className="text-sm font-medium text-emerald-600 hover:underline disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="group flex items-center justify-between gap-3 py-1">
      <span>
        {entry.quantity !== 1 ? `${entry.quantity}× ` : ""}
        {entry.foodName}
      </span>
      <span className="flex items-center gap-3">
        <span>{entry.calories} kcal</span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs text-neutral-400 hover:text-emerald-600 hover:underline"
        >
          Edit
        </button>
        <form
          action={deleteMealEntryAction}
          onSubmit={(event) => {
            if (!window.confirm(`Delete ${entry.foodName} from this log?`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="entryId" value={entry.id} />
          <input type="hidden" name="returnPath" value={returnPath} />
          <button
            type="submit"
            className="text-xs text-neutral-400 hover:text-red-600 hover:underline"
          >
            Delete
          </button>
        </form>
      </span>
    </li>
  );
}
