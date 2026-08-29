import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge proxy (formerly "middleware" — Next.js 16 renamed the
// convention; file must be named proxy.ts). Uses the edge-safe config
// only (no Prisma/bcrypt).
// Blocks unauthenticated access to any protected route (TICKET-007).
// The (app) layout and requireSession()/requireProfile() helpers add a
// second, server-side check for defense in depth.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
