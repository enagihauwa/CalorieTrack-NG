"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { foodSchema } from "@/lib/validation/food";

export type FoodActionState = { error?: string } | undefined;

function parseFood(formData: FormData) {
  return foodSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    calories: formData.get("calories"),
    proteinG: formData.get("proteinG"),
    carbsG: formData.get("carbsG"),
    fatG: formData.get("fatG"),
    servingSize: formData.get("servingSize"),
  });
}

// TICKET-041.
export async function createFoodAction(
  _prevState: FoodActionState,
  formData: FormData,
): Promise<FoodActionState> {
  await requireAdmin();

  const parsed = parseFood(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  await prisma.food.create({ data: parsed.data });
  redirect("/admin/foods");
}

// TICKET-042. Only ever touches the Food row — never MealEntry, whose
// rows already hold their own snapshot values from write time. That's
// what actually satisfies this ticket's "doesn't retroactively change
// historical totals" criterion; there's nothing here to opt out of.
export async function updateFoodAction(
  _prevState: FoodActionState,
  formData: FormData,
): Promise<FoodActionState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing food id." };
  }

  const parsed = parseFood(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  await prisma.food.update({ where: { id }, data: parsed.data });
  redirect("/admin/foods");
}

// TICKET-043: soft delete / unarchive, both through the same action —
// takes an explicit target state rather than "toggle," so it's never
// ambiguous which way it's flipping.
export async function setFoodArchivedAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  await prisma.food.update({
    where: { id },
    data: { isArchived: formData.get("archived") === "true" },
  });

  revalidatePath("/admin/foods");
}
