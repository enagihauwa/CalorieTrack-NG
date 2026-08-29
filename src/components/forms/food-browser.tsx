"use client";

import { useRouter } from "next/navigation";
import type { Food } from "@prisma/client";
import { FoodSearch } from "./food-search";

// TICKET-046: browse/discovery only — selecting a food navigates into
// the Add Food flow (TICKET-019) with it pre-selected, rather than
// duplicating the quantity/meal-category UI here.
export function FoodBrowser() {
  const router = useRouter();

  return (
    <FoodSearch
      onSelect={(food: Food) => {
        router.push(
          `/food/add?foodId=${food.id}&from=${encodeURIComponent("/food")}`,
        );
      }}
    />
  );
}
