import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "@/components/admin-nav";

// TICKET-040: every /admin/* route sits behind this — non-admins are
// redirected to /dashboard before any admin page's own code runs.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-xl font-semibold">Admin</h1>
      <AdminNav />
      {children}
    </div>
  );
}
