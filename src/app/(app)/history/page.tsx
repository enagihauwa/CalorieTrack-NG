import { requireProfile } from "@/lib/require-profile";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function HistoryPage() {
  await requireProfile();

  return (
    <PlaceholderPage title="History" ticket="tickets/EPIC-07-food-history.md" />
  );
}
