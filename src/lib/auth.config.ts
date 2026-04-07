import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config (no Prisma, no bcrypt).
 * Used by middleware and client-side session checks.
 */
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const u = user as any;
        token.role = u.role;
        token.tenantId = u.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = session.user as any;
        s.role = token.role;
        s.tenantId = token.tenantId;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublic = ["/", "/pricing", "/login", "/register"].includes(
        nextUrl.pathname,
      );

      if (isPublic) return true;
      if (!isLoggedIn) return false;
      return true;
    },
  },
} satisfies NextAuthConfig;
