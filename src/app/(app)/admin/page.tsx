import { prisma } from "@/lib/prisma";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <dt className="text-sm text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className="text-2xl font-semibold">{value.toLocaleString()}</dd>
    </div>
  );
}

// TICKET-045: minimum viable stat set, read live on every load — no
// caching layer to go stale.
export default async function AdminOverviewPage() {
  const [userCount, foodCount, mealEntryCount] = await Promise.all([
    prisma.user.count(),
    prisma.food.count(),
    prisma.mealEntry.count(),
  ]);

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Stat label="Registered users" value={userCount} />
      <Stat label="Foods in database" value={foodCount} />
      <Stat label="Logged meal entries" value={mealEntryCount} />
    </dl>
  );
}
