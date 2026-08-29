import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FoodForm } from "@/components/admin/food-form";
import { updateFoodAction } from "@/lib/actions/admin-food";

export default async function EditFoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const food = await prisma.food.findUnique({ where: { id } });

  if (!food) notFound();

  return (
    <div className="mx-auto w-full max-w-lg">
      <h2 className="mb-4 text-lg font-semibold">Edit {food.name}</h2>
      <FoodForm food={food} action={updateFoodAction} />
    </div>
  );
}
