import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { setFoodArchivedAction } from "@/lib/actions/admin-food";

// TICKET-041: unlike the public list (TICKET-017), this shows every
// food including archived ones — admins need to see and unarchive them.
export default async function AdminFoodsPage() {
  const foods = await prisma.food.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Foods</h2>
        <Link
          href="/admin/foods/new"
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + Add Food
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Category</th>
              <th className="py-2 pr-4 font-medium">Calories</th>
              <th className="py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {foods.map((food) => (
              <tr key={food.id}>
                <td className="py-2 pr-4">
                  {food.name}
                  {food.isArchived && (
                    <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      Archived
                    </span>
                  )}
                </td>
                <td className="py-2 pr-4">{food.category}</td>
                <td className="py-2 pr-4">{food.calories} kcal</td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/foods/${food.id}/edit`}
                      className="text-emerald-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={setFoodArchivedAction}>
                      <input type="hidden" name="id" value={food.id} />
                      <input
                        type="hidden"
                        name="archived"
                        value={food.isArchived ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={
                          food.isArchived
                            ? "text-emerald-600 hover:underline"
                            : "text-red-600 hover:underline"
                        }
                      >
                        {food.isArchived ? "Unarchive" : "Delete"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
