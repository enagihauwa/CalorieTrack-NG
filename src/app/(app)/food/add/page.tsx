import { requireProfile } from "@/lib/require-profile";
import { prisma } from "@/lib/prisma";
import { AddFoodForm } from "@/components/forms/add-food-form";

function safeFromPath(from?: string): string {
  if (from && from.startsWith("/") && !from.startsWith("//")) {
    return from;
  }
  return "/dashboard";
}

export default async function AddFoodPage({
  searchParams,
}: {
  searchParams: Promise<{ foodId?: string; from?: string; date?: string }>;
}) {
  await requireProfile();
  const params = await searchParams;

  const foodRow = params.foodId
    ? await prisma.food.findUnique({ where: { id: params.foodId } })
    : null;

  return (
    <AddFoodForm
      initialFood={foodRow && !foodRow.isArchived ? foodRow : null}
      from={safeFromPath(params.from)}
      date={params.date}
    />
  );
}
