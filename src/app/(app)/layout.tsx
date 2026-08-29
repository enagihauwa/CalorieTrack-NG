import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MainNav } from "@/components/main-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Only used to decide whether to show the "Admin" nav link — the
  // actual gate is requireAdmin() on the admin routes themselves, so a
  // stale/missing read here is a cosmetic miss at worst, not a security
  // hole.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <MainNav isAdmin={user?.role === "ADMIN"} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
        {children}
      </main>
    </div>
  );
}
