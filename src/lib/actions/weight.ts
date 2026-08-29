"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logWeightSchema, goalWeightSchema } from "@/lib/validation/weight";
import { toDateOnly } from "@/lib/date-only";

export type WeightActionState = { error?: string } | undefined;

// TICKET-037: one entry per date — upsert on the (userId, date) unique
// constraint rather than always creating, so logging twice for the same
// day edits the existing entry instead of duplicating it. This same
// action also serves TICKET-038's "edit" (re-submitting the form for an
// existing date's entry is exactly an update through this upsert).
export async function logWeightAction(
  _prevState: WeightActionState,
  formData: FormData,
): Promise<WeightActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = logWeightSchema.safeParse({
    weightKg: formData.get("weightKg"),
    date: formData.get("date") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const date = toDateOnly(parsed.data.date);

  await prisma.weightLog.upsert({
    where: { userId_date: { userId: session.user.id, date } },
    create: { userId: session.user.id, weightKg: parsed.data.weightKg, date },
    update: { weightKg: parsed.data.weightKg },
  });

  revalidatePath("/progress");
}

// TICKET-038: delete, scoped to the owning user only.
export async function deleteWeightLogAction(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const log = await prisma.weightLog.findUnique({ where: { id } });
  if (!log || log.userId !== session.user.id) return;

  await prisma.weightLog.delete({ where: { id } });
  revalidatePath("/progress");
}

// TICKET-037: separate control from logging a new weight entry — sets
// Profile.goalWeightKg directly, nothing to do with WeightLog.
export async function setGoalWeightAction(
  _prevState: WeightActionState,
  formData: FormData,
): Promise<WeightActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = goalWeightSchema.safeParse({
    goalWeightKg: formData.get("goalWeightKg"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a realistic weight.",
    };
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { goalWeightKg: parsed.data.goalWeightKg },
  });

  revalidatePath("/progress");
}
