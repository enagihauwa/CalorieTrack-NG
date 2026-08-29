import { prisma } from "@/lib/prisma";

// TICKET-044: read-only, and the Prisma `select` explicitly excludes
// passwordHash — no sensitive auth data ever leaves the database query,
// let alone reaches the page.
export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 font-medium">Signed up</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 pr-4">{user.profile?.name ?? "—"}</td>
              <td className="py-2 pr-4">{user.email}</td>
              <td className="py-2 pr-4">{user.role}</td>
              <td className="py-2">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
