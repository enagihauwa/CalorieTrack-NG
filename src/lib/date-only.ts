// Shared by the meal-entry action and the daily-summary aggregation —
// both need to agree on exactly how a calendar day maps to the
// @db.Date column, or "today" in one place could mismatch "today" in
// another.
export function toDateOnly(dateStr?: string): Date {
  if (dateStr) {
    return new Date(`${dateStr}T00:00:00.000Z`);
  }
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}
