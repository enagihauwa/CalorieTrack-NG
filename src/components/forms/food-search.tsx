"use client";

import { useEffect, useState } from "react";
import type { Food } from "@prisma/client";
import { inputClass } from "./field";

// TICKET-018 (search) + TICKET-046 (browse). Shared between the Add
// Food flow (selecting sets local state) and the Food page (selecting
// navigates) — the caller decides what "select" means via onSelect.
// Empty query still fetches (page 1, alphabetical) so this doubles as
// a browse view, not just a search box.
export function FoodSearch({ onSelect }: { onSelect: (food: Food) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const handle = setTimeout(() => {
      setLoading(true);
      fetch(`/api/foods?q=${encodeURIComponent(query)}&pageSize=25`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          setResults(data.foods ?? []);
          setLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search foods…"
        className={inputClass}
      />

      {loading ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Loading…
        </p>
      ) : results.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No foods found{query ? ` for "${query}"` : ""}.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 dark:divide-neutral-800">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => onSelect(food)}
                className="flex w-full items-center justify-between gap-4 py-2 text-left hover:text-emerald-600"
              >
                <span>
                  <span className="font-medium">{food.name}</span>{" "}
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    ({food.category})
                  </span>
                </span>
                <span className="whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                  {food.calories} kcal / {food.servingSize}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
