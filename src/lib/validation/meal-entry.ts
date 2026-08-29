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
