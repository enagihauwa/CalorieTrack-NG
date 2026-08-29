import { requireProfile } from "@/lib/require-profile";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function FoodPage() {
  await requireProfile();

  return (
    <PlaceholderPage
      title="Food"
      ticket="tickets/EPIC-04-food-search-add.md (TICKET-046)"
    />
  );
}
