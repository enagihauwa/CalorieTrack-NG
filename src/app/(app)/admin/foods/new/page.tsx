import { FoodForm } from "@/components/admin/food-form";
import { createFoodAction } from "@/lib/actions/admin-food";

export default function NewFoodPage() {
  return (
    <div className="mx-auto w-full max-w-lg">
      <h2 className="mb-4 text-lg font-semibold">Add Food</h2>
      <FoodForm action={createFoodAction} />
    </div>
  );
}
