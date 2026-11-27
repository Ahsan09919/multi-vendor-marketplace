import type { NextAuthConfig } from "next-auth";

// Edge-safe NextAuth config (no Prisma / bcrypt imports) shared by the
// middleware and the full server-side auth setup in lib/auth.ts.
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.vendorId = user.vendorId;
        token.vendorStatus = user.vendorStatus;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "CUSTOMER" | "VENDOR" | "ADMIN";
        session.user.vendorId = token.vendorId as string | null;
        session.user.vendorStatus = token.vendorStatus as
          | "PENDING"
          | "APPROVED"
          | "SUSPENDED"
          | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
