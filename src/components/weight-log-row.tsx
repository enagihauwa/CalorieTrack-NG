"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteWeightLogAction, logWeightAction } from "@/lib/actions/weight";
import { inputClass } from "./forms/field";

export type WeightLogItem = { id: string; date: string; weightKg: number };

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateStr}T00:00:00.000Z`));
}

// TICKET-038. Edit reuses logWeightAction — since it's an upsert keyed
// on (userId, date), re-submitting the form for this entry's existing
// date is exactly an update, not a separate code path.
export function WeightLogRow({ log }: { log: WeightLogItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    logWeightAction,
    undefined,
  );

  // Same fix as MealEntryRow: close the inline editor once a submit
  // finishes without error, since editing a weight value doesn't move
  // the row anywhere (no remount to reset state naturally).
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
          <input type="hidden" name="date" value={log.date} />
          <span className="flex-1 text-sm">{formatDate(log.date)}</span>
          <input
            name="weightKg"
            type="number"
            step="0.1"
            min={20}
            max={400}
            defaultValue={log.weightKg}
            className={`w-24 py-1 text-sm ${inputClass}`}
          />
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
    <li className="flex items-center justify-between gap-3 py-1">
      <span>{formatDate(log.date)}</span>
      <span className="flex items-center gap-3">
        <span>{log.weightKg} kg</span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs text-neutral-400 hover:text-emerald-600 hover:underline"
        >
          Edit
        </button>
        <form
          action={deleteWeightLogAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Delete the ${formatDate(log.date)} weight entry?`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={log.id} />
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
