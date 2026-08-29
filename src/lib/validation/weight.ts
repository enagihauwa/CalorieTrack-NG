import { z } from "zod";

// TICKET-037: shared by the log-weight form and its server action.
export const logWeightSchema = z.object({
  weightKg: z.coerce
    .number()
    .min(20, "Enter a realistic weight in kg.")
    .max(400, "Enter a realistic weight in kg."),
  // Optional YYYY-MM-DD, defaults to today — same convention as
  // meal-entry logging.
  date: z.string().optional(),
});

export const goalWeightSchema = z.object({
  goalWeightKg: z.coerce
    .number()
    .min(20, "Enter a realistic weight in kg.")
    .max(400, "Enter a realistic weight in kg."),
});
