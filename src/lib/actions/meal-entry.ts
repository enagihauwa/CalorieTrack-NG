"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logMealEntrySchema } from "@/lib/validation/meal-entry";
import { toDateOnly } from "@/lib/date-only";

export type LogMealEntryActionState = { error?: string } | undefined;

// Only ever redirect back to a same-origin path — formData's "from"
// comes from a query param a user could tamper with, so this guards
// against it being turned into an open redirect.
function safeRedirectTarget(from: FormDataEntryValue | null): string {
  if (
    typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//")
  ) {
    return from;
  }
  return "/dashboard";
}

// TICKET-022: the write path TICKET-019's Add Food flow calls.
export async function logMealEntryAction(
  _prevState: LogMealEntryActionState,
  formData: FormData,
): Promise<LogMealEntryActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = logMealEntrySchema.safeParse({
    foodId: formData.get("foodId"),
    quantity: formData.get("quantity"),
    mealCategory: formData.get("mealCategory"),
    date: formData.get("date") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const food = await prisma.food.findUnique({
    where: { id: parsed.data.foodId },
  });
  if (!food || food.isArchived) {
    return { error: "That food is no longer available — please search again." };
  }

  const { quantity } = parsed.data;

  await prisma.mealEntry.create({
    data: {
      userId: session.user.id,
      foodId: food.id,
      quantity,
      mealCategory: parsed.data.mealCategory,
      date: toDateOnly(parsed.data.date),
      // Snapshot at write time — see the MealEntry schema comment on
      // why this isn't recomputed from live Food data on read.
      calories: Math.round(food.calories * quantity),
      proteinG: food.proteinG * quantity,
      carbsG: food.carbsG * quantity,
      fatG: food.fatG * quantity,
    },
  });

  redirect(safeRedirectTarget(formData.get("from")));
}
