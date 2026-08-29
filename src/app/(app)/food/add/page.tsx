import { requireProfile } from "@/lib/require-profile";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function AddFoodPage() {
  await requireProfile();

  return (
    <PlaceholderPage
      title="Add Food"
      ticket="tickets/EPIC-04-food-search-add.md (TICKET-019/020)"
    />
  );
}
