import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@asafarim/db";
import { googleProvider, credentialsProvider } from "./providers";
import "./types";

function getCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  if (domain) return domain;
  if (process.env.NODE_ENV === "production") return ".asafarim.com";
  return undefined;
}

function slugifyUsername(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

async function generateUniqueUsername(seed: string): Promise<string> {
  const base = slugifyUsername(seed) || "user";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    counter += 1;
    candidate = `${base.slice(0, Math.max(1, 24 - String(counter).length - 1))}_${counter}`;
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [googleProvider, credentialsProvider],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
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
      },
    },
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            role: true,
            tenantId: true,
            username: true,
            emailVerified: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.tenantId = dbUser.tenantId;
          token.username = dbUser.username;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
        }
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            role: true,
            tenantId: true,
            name: true,
            image: true,
            username: true,
            emailVerified: true,
          },
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.tenantId = dbUser.tenantId;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.username = dbUser.username;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.username = (token.username as string | null) ?? null;
        session.user.emailVerified = (
          token.emailVerified ? new Date(token.emailVerified as string) : null
        ) as typeof session.user.emailVerified;
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        if (user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              username: true,
              emailVerified: true,
              email: true,
              name: true,
            },
          });

          if (dbUser && (!dbUser.username || !dbUser.emailVerified)) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                username:
                  dbUser.username ??
                  (await generateUniqueUsername(
                    dbUser.name || dbUser.email?.split("@")[0] || "user"
                  )),
                emailVerified: dbUser.emailVerified ?? new Date(),
              },
            });
          }
        }

        return true;
      }

      if (!user) return false;

      return true;
    },
  },

  trustHost: true,

  debug: process.env.NODE_ENV === "development",
};

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };
export { hashPassword, verifyPassword } from "./providers";
