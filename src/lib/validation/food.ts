import { z } from "zod";

// TICKET-041/042: shared by the admin create and edit food forms.
// `category` is free text, not an enum — TICKET-015 decided categories
// must stay extendable by admins, not hardcoded.
export const foodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(100, "Name is too long."),
  category: z
    .string()
    .trim()
    .min(1, "Category is required.")
    .max(50, "Category is too long."),
  calories: z.coerce
    .number()
    .int("Calories must be a whole number.")
    .min(0, "Calories can't be negative.")
    .max(5000, "Enter a realistic calorie value."),
  proteinG: z.coerce
    .number()
    .min(0, "Can't be negative.")
    .max(500, "Enter a realistic value."),
  carbsG: z.coerce
    .number()
    .min(0, "Can't be negative.")
    .max(500, "Enter a realistic value."),
  fatG: z.coerce
    .number()
    .min(0, "Can't be negative.")
    .max(500, "Enter a realistic value."),
  servingSize: z
    .string()
    .trim()
    .min(1, "Serving size is required.")
    .max(100, "Serving size is too long."),
});
