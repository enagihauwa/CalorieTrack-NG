import type { NextAuthConfig } from "next-auth";

// Edge-safe half of the NextAuth config (TICKET-007). Deliberately has
// no providers here — the Credentials provider's authorize() callback
// needs Prisma + bcrypt, which can't run in Edge middleware. Full
// config lives in src/auth.ts and spreads this in.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const path = request.nextUrl.pathname;
      const isPublicPath =
        path === "/" || path.startsWith("/login") || path.startsWith("/signup");

      if (isPublicPath) return true;
      return isLoggedIn; // false -> NextAuth redirects to pages.signIn
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
