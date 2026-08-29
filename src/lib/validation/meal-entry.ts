import { z } from "zod";

// TICKET-019/022: shared by the Add Food flow's client-side quantity
// input and the server action that actually logs the entry.
export const logMealEntrySchema = z.object({
  foodId: z.string().min(1, "Select a food first."),
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0.")
    .max(50, "Enter a realistic quantity."),
  mealCategory: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACKS"], {
    message: "Select a meal category.",
  }),
  // Optional YYYY-MM-DD. Absent = today. See TICKET-019's date-context
  // criterion — this schema doesn't decide the date, just accepts one.
  date: z.string().optional(),
});

// TICKET-024: editing an existing entry — quantity and meal category
// only. The food itself isn't editable; picking the wrong food entirely
// is a delete-and-re-add case via the existing search flow, not an
// in-place edit.
export const updateMealEntrySchema = z.object({
  entryId: z.string().min(1),
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0.")
    .max(50, "Enter a realistic quantity."),
  mealCategory: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACKS"], {
    message: "Select a meal category.",
  }),
});
