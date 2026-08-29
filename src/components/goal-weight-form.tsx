"use client";

import { useActionState } from "react";
import { setGoalWeightAction } from "@/lib/actions/weight";
import { inputClass } from "./forms/field";

// TICKET-037: a control separate from logging a new weight entry —
// this only ever touches Profile.goalWeightKg.
export function GoalWeightForm({
  currentGoalWeightKg,
}: {
  currentGoalWeightKg: number | null;
}) {
  const [state, formAction, isPending] = useActionState(
    setGoalWeightAction,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
    >
      <h3 className="font-semibold">Goal Weight</h3>
      {state?.error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm font-medium">
        Goal weight (kg)
        <input
          name="goalWeightKg"
          type="number"
          step="0.1"
          min={20}
          max={400}
          defaultValue={currentGoalWeightKg ?? undefined}
          required
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending
          ? "Saving…"
          : currentGoalWeightKg
            ? "Update Goal"
            : "Set Goal"}
      </button>
    </form>
  );
}
