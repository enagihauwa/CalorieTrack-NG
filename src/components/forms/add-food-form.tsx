"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { Food } from "@prisma/client";
import { logMealEntryAction } from "@/lib/actions/meal-entry";
import { FoodSearch } from "./food-search";
import { inputClass } from "./field";

const MEAL_CATEGORY_OPTIONS = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "LUNCH", label: "Lunch" },
  { value: "DINNER", label: "Dinner" },
  { value: "SNACKS", label: "Snacks" },
] as const;

export function AddFoodForm({
  initialFood,
  from,
  date,
}: {
  initialFood: Food | null;
  from: string;
  date?: string;
}) {
  const [selectedFood, setSelectedFood] = useState<Food | null>(initialFood);
  const [quantity, setQuantity] = useState(1);
  const [state, formAction, isPending] = useActionState(
    logMealEntryAction,
    undefined,
  );

  if (!selectedFood) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <h1 className="text-xl font-semibold">Add Food</h1>
        <FoodSearch onSelect={setSelectedFood} />
        <Link href={from} className="text-sm text-neutral-500 hover:underline">
          Cancel
        </Link>
      </div>
    );
  }

  const totalCalories = Math.round(selectedFood.calories * quantity);
  const totalProtein = (selectedFood.proteinG * quantity).toFixed(1);
  const totalCarbs = (selectedFood.carbsG * quantity).toFixed(1);
  const totalFat = (selectedFood.fatG * quantity).toFixed(1);

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-lg flex-col gap-4"
    >
      <h1 className="text-xl font-semibold">Add Food</h1>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
        <div>
          <p className="font-semibold">{selectedFood.name}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {selectedFood.calories} kcal / {selectedFood.servingSize}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedFood(null)}
          className="text-sm text-emerald-600 hover:underline"
        >
          Change
        </button>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Quantity
        <input
          name="quantity"
          type="number"
          min={0.25}
          max={50}
          step="any"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value) || 0)}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Meal
        <select
          name="mealCategory"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Select…
          </option>
          {MEAL_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
        <p className="font-semibold">Total: {totalCalories} kcal</p>
        <p className="text-neutral-500 dark:text-neutral-400">
          Protein {totalProtein}g · Carbs {totalCarbs}g · Fat {totalFat}g
        </p>
      </div>

      <input type="hidden" name="foodId" value={selectedFood.id} />
      <input type="hidden" name="from" value={from} />
      {date && <input type="hidden" name="date" value={date} />}

      <button
        type="submit"
        disabled={isPending || quantity <= 0}
        className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {isPending ? "Adding…" : "Add Food"}
      </button>

      <Link
        href={from}
        className="text-center text-sm text-neutral-500 hover:underline"
      >
        Cancel
      </Link>
    </form>
  );
}
