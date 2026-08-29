import { requireProfile } from "@/lib/require-profile";
import { FoodBrowser } from "@/components/forms/food-browser";

export default async function FoodPage() {
  await requireProfile();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold">Food</h1>
      <FoodBrowser />
    </div>
  );
}
