import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TICKET-016 (EPIC-03). Values are approximate MVP defaults, not lab
// measurements — sourced from standard nutrition references (USDA
// FoodData Central for generic staples; commonly published estimates
// for Nigerian dishes, cross-checked against typical Nigerian Food
// Composition Table figures) for the serving size named. They're
// editable later via the admin food-management UI (EPIC-10) once real
// measured data is available; the MVP just needs plausible, non-blank
// numbers to compute against.
//
// Jollof Rice's values are the exact figures from the requirements
// brief itself (Section 10's worked example), not derived — that's the
// one entry with an authoritative source rather than an estimate.
//
// Every food named in Section 4's example list and Section 15's
// Nigerian-food list is covered here. A few names in those two lists
// refer to the same food (Section 4's generic "Rice" and "Egg" vs.
// Section 15's "White Rice" and "Eggs") — rather than create two
// near-duplicate entries for one dish, each is seeded once under the
// more descriptive name.
const foods = [
  // --- Section 4 examples + generic staples ---
  {
    name: "White Rice",
    category: "Rice",
    calories: 205,
    proteinG: 4.3,
    carbsG: 45,
    fatG: 0.4,
    servingSize: "1 cup",
  },
  {
    name: "Beans",
    category: "Legume",
    calories: 254,
    proteinG: 15.2,
    carbsG: 45,
    fatG: 1.1,
    servingSize: "1 cup",
  },
  {
    name: "Chicken",
    category: "Protein",
    calories: 165,
    proteinG: 31,
    carbsG: 0,
    fatG: 3.6,
    servingSize: "100g (grilled, no skin)",
  },
  {
    name: "Egg",
    category: "Protein",
    calories: 78,
    proteinG: 6.3,
    carbsG: 0.6,
    fatG: 5.3,
    servingSize: "1 large (boiled)",
  },
  {
    name: "Bread",
    category: "Grain",
    calories: 100,
    proteinG: 3.6,
    carbsG: 18,
    fatG: 1.2,
    servingSize: "1 slice",
  },
  {
    name: "Yam",
    category: "Tuber",
    calories: 177,
    proteinG: 2.3,
    carbsG: 42,
    fatG: 0.2,
    servingSize: "1 cup (boiled)",
  },
  {
    name: "Banana",
    category: "Fruit",
    calories: 105,
    proteinG: 1.3,
    carbsG: 27,
    fatG: 0.4,
    servingSize: "1 medium",
  },
  {
    name: "Apple",
    category: "Fruit",
    calories: 95,
    proteinG: 0.5,
    carbsG: 25,
    fatG: 0.3,
    servingSize: "1 medium",
  },
  {
    // Values taken directly from Section 10's worked example.
    name: "Jollof Rice",
    category: "Rice",
    calories: 350,
    proteinG: 8,
    carbsG: 55,
    fatG: 12,
    servingSize: "1 cup",
  },

  // --- Section 15: Breakfast ---
  {
    name: "Akara",
    category: "Snack",
    calories: 180,
    proteinG: 7,
    carbsG: 12,
    fatG: 12,
    servingSize: "2 pieces",
  },
  {
    name: "Pap",
    category: "Beverage",
    calories: 120,
    proteinG: 1.5,
    carbsG: 27,
    fatG: 0.5,
    servingSize: "1 cup",
  },
  {
    name: "Moi Moi",
    category: "Protein",
    calories: 200,
    proteinG: 11,
    carbsG: 15,
    fatG: 10,
    servingSize: "1 wrap",
  },

  // --- Section 15: Lunch / Dinner ---
  {
    name: "Fried Rice",
    category: "Rice",
    calories: 340,
    proteinG: 7,
    carbsG: 50,
    fatG: 11,
    servingSize: "1 cup",
  },
  {
    name: "Eba",
    category: "Swallow",
    calories: 250,
    proteinG: 1.5,
    carbsG: 58,
    fatG: 0.3,
    servingSize: "1 wrap",
  },
  {
    name: "Amala",
    category: "Swallow",
    calories: 230,
    proteinG: 2,
    carbsG: 54,
    fatG: 0.3,
    servingSize: "1 wrap",
  },
  {
    name: "Pounded Yam",
    category: "Swallow",
    calories: 300,
    proteinG: 3,
    carbsG: 68,
    fatG: 0.5,
    servingSize: "1 wrap",
  },
  {
    name: "Egusi Soup",
    category: "Soup",
    calories: 400,
    proteinG: 18,
    carbsG: 12,
    fatG: 32,
    servingSize: "1 bowl",
  },
  {
    name: "Okra Soup",
    category: "Soup",
    calories: 250,
    proteinG: 14,
    carbsG: 10,
    fatG: 17,
    servingSize: "1 bowl",
  },
  {
    name: "Afang Soup",
    category: "Soup",
    calories: 280,
    proteinG: 16,
    carbsG: 8,
    fatG: 20,
    servingSize: "1 bowl",
  },
  {
    name: "Fish",
    category: "Protein",
    calories: 200,
    proteinG: 30,
    carbsG: 0,
    fatG: 8,
    servingSize: "1 fillet (150g, grilled)",
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const food of foods) {
    // Match on name to keep this re-runnable without duplicating rows
    // (TICKET-016's acceptance criterion). Skips rather than overwrites
    // an existing row, so an admin edit (TICKET-042) to a seeded food
    // survives a re-seed.
    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.food.create({ data: food });
    created++;
  }

  console.log(
    `Seed complete: ${created} created, ${skipped} already existed (skipped).`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
