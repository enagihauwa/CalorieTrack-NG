import { requireProfile } from "@/lib/require-profile";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function DashboardPage() {
  await requireProfile();

  return (
    <PlaceholderPage title="Dashboard" ticket="tickets/EPIC-06-dashboard.md" />
  );
}
