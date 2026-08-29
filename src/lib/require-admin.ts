import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// TICKET-040: reads role fresh from the database on every call rather
// than trusting a claim baked into the JWT at login time — a JWT can
// outlive a role change (e.g. an admin demoted mid-session), and this
// app already pays a Prisma round-trip per protected page anyway
// (requireProfile does the same thing for profile checks).
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") redirect("/dashboard");

  return session;
}
