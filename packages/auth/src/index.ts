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
            tenantId: true,
            username: true,
            emailVerified: true,
            isActive: true,
            userRoles: { select: { role: { select: { name: true } } } },
          },
        });

        if (dbUser) {
          token.roles = dbUser.userRoles.map((ur) => ur.role.name);
          token.tenantId = dbUser.tenantId;
          token.username = dbUser.username;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
          token.isActive = dbUser.isActive;
        }
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub! },
          select: {
            tenantId: true,
            name: true,
            image: true,
            username: true,
            emailVerified: true,
            isActive: true,
            userRoles: { select: { role: { select: { name: true } } } },
          },
        });

        if (dbUser) {
          token.roles = dbUser.userRoles.map((ur) => ur.role.name);
          token.tenantId = dbUser.tenantId;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.username = dbUser.username;
          token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
          token.isActive = dbUser.isActive;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.roles = (token.roles as string[]) ?? [];
        session.user.tenantId = (token.tenantId as string | null) ?? null;
        session.user.username = (token.username as string | null) ?? null;
        session.user.emailVerified = (
          token.emailVerified ? new Date(token.emailVerified as string) : null
        ) as typeof session.user.emailVerified;
        session.user.isActive = token.isActive as boolean;
        if (typeof token.name === "string" || token.name === null) {
          session.user.name = (token.name as string | null) ?? null;
        }
        if (typeof token.picture === "string" || token.picture === null) {
          session.user.image = (token.picture as string | null) ?? null;
        }
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
              isActive: true,
              userRoles: { select: { id: true } },
            },
          });

          if (dbUser && !dbUser.isActive) {
            return false; // Block deactivated users
          }

          if (dbUser) {
            const updates: Record<string, unknown> = {};
            if (!dbUser.username) {
              updates.username = await generateUniqueUsername(
                dbUser.name || dbUser.email?.split("@")[0] || "user"
              );
            }
            if (!dbUser.emailVerified) {
              updates.emailVerified = new Date();
            }
            if (Object.keys(updates).length > 0) {
              await prisma.user.update({ where: { id: user.id }, data: updates });
            }

            // Assign default role if user has none
            if (dbUser.userRoles.length === 0) {
              const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
              if (defaultRole) {
                await prisma.userRole.create({
                  data: { userId: user.id, roleId: defaultRole.id },
                });
              }
            }
          }
        }

        return true;
      }

      if (!user) return false;

      // Block deactivated credential users
      if (user.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { isActive: true },
        });
        if (dbUser && !dbUser.isActive) return false;
      }

      return true;
    },
  },

  trustHost: true,

  debug: process.env.NODE_ENV === "development",
};

const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

export { handlers, auth, signIn, signOut };
export { hashPassword, verifyPassword } from "./providers";
