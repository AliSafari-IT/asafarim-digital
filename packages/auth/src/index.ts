import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@asafarim/db";
import { googleProvider, credentialsProvider } from "./providers";

/**
 * Determine cookie domain for cross-subdomain SSO.
 * - Production/QA: ".asafarim.com" → shared across all subdomains
 * - Development: undefined → defaults to current hostname (localhost)
 */
function getCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  if (domain) return domain;
  if (process.env.NODE_ENV === "production") return ".asafarim.com";
  return undefined; // localhost in dev
}

/**
 * Shared Auth.js configuration — imported by every app's route handler.
 *
 * Key SSO mechanism: the session cookie is scoped to `.asafarim.com`,
 * so all subdomains (portal, content-generator, etc.) share one session.
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [googleProvider, credentialsProvider],

  session: {
    strategy: "jwt", // JWT strategy required for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getCookieDomain(),
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.callback-url"
          : "authjs.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: getCookieDomain(),
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-authjs.csrf-token"
          : "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Note: __Host- cookies cannot have a domain set
      },
    },
  },

  pages: {
    signIn: "/sign-in",
    // signUp is not a built-in Auth.js page; we handle it manually
    error: "/sign-in", // Redirect auth errors to sign-in page
  },

  callbacks: {
    /**
     * Enrich the JWT with user role and tenant info.
     * This runs every time a JWT is created or updated.
     */
    async jwt({ token, user, trigger }) {
      if (user) {
        // Initial sign-in — fetch full user data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, tenantId: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.tenantId = dbUser.tenantId;
        }
      }

      // Handle session updates (e.g., after role change)
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: { role: true, tenantId: true, name: true, image: true },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.tenantId = dbUser.tenantId;
          token.name = dbUser.name;
          token.picture = dbUser.image;
        }
      }

      return token;
    },

    /**
     * Expose role and tenant in the client-side session.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
      }
      return session;
    },

    /**
     * Control which sign-in attempts are allowed.
     */
    async signIn({ user, account }) {
      // Allow OAuth sign-ins
      if (account?.provider !== "credentials") return true;

      // For credentials, user must exist (authorize already validated)
      if (!user) return false;

      return true;
    },
  },

  // Trust the reverse proxy (Nginx)
  trustHost: true,

  debug: process.env.NODE_ENV === "development",
};

// Create the Auth.js handler and helpers
const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };

// Re-export utilities
export { hashPassword, verifyPassword } from "./providers";
