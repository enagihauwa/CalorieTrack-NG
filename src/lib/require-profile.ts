import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// TICKET-007: server-side defense-in-depth alongside the edge
// middleware — also the only place that actually has session.user.id
// for queries, since middleware can't touch Prisma.
export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session;
}

// TICKET-008: "user cannot reach Dashboard without completing profile."
// Applied to every (app) page except /profile itself, which is the page
// that lets a user without one create it.
export async function requireProfile() {
  const session = await requireSession();
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/profile");
  return { session, profile };
}
