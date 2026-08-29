"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  logMealEntrySchema,
  updateMealEntrySchema,
} from "@/lib/validation/meal-entry";
import { toDateOnly } from "@/lib/date-only";

export type LogMealEntryActionState = { error?: string } | undefined;
export type MealEntryMutationState = { error?: string } | undefined;

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

// TICKET-024: edit quantity/meal category on an existing entry.
// Recomputes calories/macros from the food's *current* per-serving
// values × the new quantity — same snapshot-at-write approach as
// TICKET-022, just triggered by an edit-write instead of a create-write.
// Doesn't redirect — stays on whatever page it was called from, so it
// revalidates that page's data instead.
export async function updateMealEntryAction(
  _prevState: MealEntryMutationState,
  formData: FormData,
): Promise<MealEntryMutationState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = updateMealEntrySchema.safeParse({
    entryId: formData.get("entryId"),
    quantity: formData.get("quantity"),
    mealCategory: formData.get("mealCategory"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const entry = await prisma.mealEntry.findUnique({
    where: { id: parsed.data.entryId },
    include: { food: true },
  });
  // Scoped to the owning user only — TICKET-024's acceptance criterion.
  if (!entry || entry.userId !== session.user.id) {
    return { error: "Entry not found." };
  }

  const { quantity } = parsed.data;

  await prisma.mealEntry.update({
    where: { id: entry.id },
    data: {
      quantity,
      mealCategory: parsed.data.mealCategory,
      calories: Math.round(entry.food.calories * quantity),
      proteinG: entry.food.proteinG * quantity,
      carbsG: entry.food.carbsG * quantity,
      fatG: entry.food.fatG * quantity,
    },
  });

  revalidatePath(safeRedirectTarget(formData.get("returnPath")));
}

// TICKET-024: delete an entry. Silently no-ops on a missing/foreign
// entry rather than erroring — this only happens from a stale UI state
// (e.g. double-submit), never from a normal user action.
export async function deleteMealEntryAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const entryId = formData.get("entryId");
  if (typeof entryId !== "string" || !entryId) return;

  const entry = await prisma.mealEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.userId !== session.user.id) return;

  await prisma.mealEntry.delete({ where: { id: entryId } });

  revalidatePath(safeRedirectTarget(formData.get("returnPath")));
}
