"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validation/profile";
import { calculateDailyCalorieTarget } from "@/lib/calorie-target";

export type ProfileActionState = { error?: string } | undefined;

// TICKET-008 (create) and TICKET-010 (edit) share this one action —
// Prisma's upsert makes "create if missing, else update" a single
// operation, and the daily calorie target is recomputed unconditionally
// on every save. That trivially satisfies TICKET-014's "recalculate
// only when a calculation-relevant field changes": recomputing with
// unchanged inputs yields the same number, so there's no need to diff
// old vs. new values to get the same observable behavior.
export async function saveProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    age: formData.get("age"),
    gender: formData.get("gender"),
    weightKg: formData.get("weightKg"),
    heightCm: formData.get("heightCm"),
    activityLevel: formData.get("activityLevel"),
    goal: formData.get("goal"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Check the form for errors.",
    };
  }

  const dailyCalorieTarget = calculateDailyCalorieTarget(parsed.data);

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...parsed.data, dailyCalorieTarget },
    update: { ...parsed.data, dailyCalorieTarget },
  });

  redirect("/dashboard");
}
