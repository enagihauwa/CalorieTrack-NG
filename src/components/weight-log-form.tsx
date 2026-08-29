"use client";

import { useActionState } from "react";
import { logWeightAction } from "@/lib/actions/weight";
import { inputClass } from "./forms/field";

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WeightLogForm() {
  const [state, formAction, isPending] = useActionState(
    logWeightAction,
    undefined,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
    >
      <h3 className="font-semibold">Log Weight</h3>
      {state?.error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm font-medium">
        Weight (kg)
        <input
          name="weightKg"
          type="number"
          step="0.1"
          min={20}
          max={400}
          required
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Date
        <input
          name="date"
          type="date"
          defaultValue={todayStr()}
          max={todayStr()}
          className={inputClass}
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Log Weight"}
      </button>
    </form>
  );
}
