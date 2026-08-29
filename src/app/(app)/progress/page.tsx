import { requireProfile } from "@/lib/require-profile";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function ProgressPage() {
  await requireProfile();

  return (
    <PlaceholderPage
      title="Progress"
      ticket="tickets/EPIC-08-progress-stats.md"
    />
  );
}
