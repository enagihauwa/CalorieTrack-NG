import { z } from "zod";

// Shared by the profile create (onboarding) and edit flows (TICKET-008,
// TICKET-009, TICKET-010) — one schema, reused, per TICKET-009's
// acceptance criterion that validation not be duplicated client vs.
// server or across create vs. edit.
//
// Deliberately does NOT include goalWeight — that field belongs to the
// Weight Tracking page (TICKET-037, EPIC-09), not this onboarding form.
// See tickets/EPIC-09-weight-tracking.md for why.
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name is too long."),
  age: z.coerce
    .number()
    .int("Age must be a whole number.")
    .min(13, "Age must be at least 13.")
    .max(120, "Enter a realistic age."),
  gender: z.enum(["MALE", "FEMALE"], { message: "Select a gender." }),
  weightKg: z.coerce
    .number()
    .min(20, "Enter a realistic weight in kg.")
    .max(400, "Enter a realistic weight in kg."),
  heightCm: z.coerce
    .number()
    .min(100, "Enter a realistic height in cm.")
    .max(250, "Enter a realistic height in cm."),
  activityLevel: z.enum(
    ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"],
    {
      message: "Select an activity level.",
    },
  ),
  goal: z.enum(["LOSE", "MAINTAIN", "GAIN"], { message: "Select a goal." }),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
