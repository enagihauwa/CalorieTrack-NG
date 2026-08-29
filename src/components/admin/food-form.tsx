"use client";

import { useActionState } from "react";
import type { Food } from "@prisma/client";
import type { FoodActionState } from "@/lib/actions/admin-food";
import { inputClass } from "../forms/field";

export function FoodForm({
  food,
  action,
}: {
  food?: Food;
  action: (
    state: FoodActionState,
    formData: FormData,
  ) => Promise<FoodActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      {food && <input type="hidden" name="id" value={food.id} />}

      <label className="flex flex-col gap-1 text-sm font-medium">
        Name
        <input
          name="name"
          type="text"
          required
          defaultValue={food?.name}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category
          <input
            name="category"
            type="text"
            required
            defaultValue={food?.category}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Serving size
          <input
            name="servingSize"
            type="text"
            required
            placeholder="e.g. 1 cup"
            defaultValue={food?.servingSize}
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Calories (per serving)
        <input
          name="calories"
          type="number"
          required
          min={0}
          max={5000}
          defaultValue={food?.calories}
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Protein (g)
          <input
            name="proteinG"
            type="number"
            step="0.1"
            required
            min={0}
            max={500}
            defaultValue={food?.proteinG}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Carbs (g)
          <input
            name="carbsG"
            type="number"
            step="0.1"
            required
            min={0}
            max={500}
            defaultValue={food?.carbsG}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Fat (g)
          <input
            name="fatG"
            type="number"
            step="0.1"
            required
            min={0}
            max={500}
            defaultValue={food?.fatG}
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Saving…" : food ? "Save changes" : "Add Food"}
      </button>
    </form>
  );
}
