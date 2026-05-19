import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "@asafarim/db";
import { googleProvider, credentialsProvider, emailCodeProvider } from "./providers";
import "./types";

type AuthUserLike = {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
};

type AuthAccountLike = {
  provider: string;
  providerAccountId: string;
  type?: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  token_type?: string | null;
  scope?: string | null;
  id_token?: string | null;
  session_state?: string | null;
} | null;

function getCookieDomain(): string | undefined {
  const domain = process.env.AUTH_COOKIE_DOMAIN;
  if (domain) return domain;
  if (process.env.NODE_ENV === "production") return ".asafarim.com";
  // In development, use localhost to share cookies across ports
  return "localhost";
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

async function ensureDefaultRole(userId: string) {
  const existingRole = await prisma.userRole.findFirst({
    where: { userId },
    select: { id: true },
  });
  if (existingRole) return;

  const defaultRole = await prisma.role.findFirst({ where: { isDefault: true } });
  if (!defaultRole) return;

  await prisma.userRole.create({
    data: { userId, roleId: defaultRole.id },
  });
}

async function ensureAuthUser(user: AuthUserLike, account?: AuthAccountLike) {
  const accountUser = account
    ? await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
        select: { userId: true },
      })
    : null;

  let dbUser = accountUser
    ? await prisma.user.findUnique({
        where: { id: accountUser.userId },
        include: { userRoles: { select: { role: { select: { name: true } } } } },
      })
    : null;

  if (!dbUser && user.id) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { userRoles: { select: { role: { select: { name: true } } } } },
    });
  }

  if (!dbUser && user.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: { userRoles: { select: { role: { select: { name: true } } } } },
    });
  }

  if (!dbUser && user.email) {
    dbUser = await prisma.user.create({
      data: {
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: new Date(),
        username: await generateUniqueUsername(user.name || user.email.split("@")[0] || "user"),
      },
      include: { userRoles: { select: { role: { select: { name: true } } } } },
    });
  }

  if (!dbUser) return null;

  if (!dbUser.isActive) return dbUser;

  const updates: Record<string, unknown> = {};
  if (!dbUser.username) {
    updates.username = await generateUniqueUsername(
      dbUser.name || dbUser.email?.split("@")[0] || "user"
    );
  }
  if (!dbUser.emailVerified) {
    updates.emailVerified = new Date();
  }
  if (user.name && user.name !== dbUser.name) {
    updates.name = user.name;
  }
  if (user.image && user.image !== dbUser.image) {
    updates.image = user.image;
  }

  if (Object.keys(updates).length > 0) {
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: updates,
      include: { userRoles: { select: { role: { select: { name: true } } } } },
    });
  }

  if (account) {
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      update: {
        userId: dbUser.id,
        type: account.type ?? "oauth",
        refresh_token: account.refresh_token ?? undefined,
        access_token: account.access_token ?? undefined,
        expires_at: account.expires_at ?? undefined,
        token_type: account.token_type ?? undefined,
        scope: account.scope ?? undefined,
        id_token: account.id_token ?? undefined,
        session_state: account.session_state ?? undefined,
      },
      create: {
        userId: dbUser.id,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        type: account.type ?? "oauth",
        refresh_token: account.refresh_token ?? undefined,
        access_token: account.access_token ?? undefined,
        expires_at: account.expires_at ?? undefined,
        token_type: account.token_type ?? undefined,
        scope: account.scope ?? undefined,
        id_token: account.id_token ?? undefined,
        session_state: account.session_state ?? undefined,
      },
    });
  }

  await ensureDefaultRole(dbUser.id);

  return prisma.user.findUnique({
    where: { id: dbUser.id },
    include: { userRoles: { select: { role: { select: { name: true } } } } },
  });
}

function applyDbUserToToken(
  token: Record<string, unknown>,
  dbUser: Awaited<ReturnType<typeof ensureAuthUser>>
) {
  if (!dbUser) return;
  token.sub = dbUser.id;
  token.roles = dbUser.userRoles.map((ur) => ur.role.name);
  token.tenantId = dbUser.tenantId;
  token.name = dbUser.name;
  token.picture = dbUser.image;
  token.username = dbUser.username;
  token.emailVerified = dbUser.emailVerified?.toISOString() ?? null;
  token.isActive = dbUser.isActive;
}

export const authConfig: NextAuthConfig = {
  // PrismaAdapter removed - using JWT strategy which doesn't need database adapter
  // adapter: PrismaAdapter(prisma),

  providers: [googleProvider, credentialsProvider, emailCodeProvider],

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
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      // Allow cross-origin callbacks for trusted domains
      const trustedOrigins = [
        process.env.NEXT_PUBLIC_PORTAL_URL,
        process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL,
        process.env.NEXT_PUBLIC_OPS_HUB_URL,
        process.env.NEXT_PUBLIC_EDUMATCH_URL,
        process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL,
        process.env.NEXT_PUBLIC_VIONTO_URL,
      ]
        .filter((u): u is string => Boolean(u))
        .map((u) => new URL(u).origin);
      
      try {
        const urlOrigin = new URL(url).origin;
        if (trustedOrigins.includes(urlOrigin)) return url;
      } catch {
        // ignore invalid URLs
      }
      
      return baseUrl;
    },

    async jwt({ token, user, account, trigger }) {
      if (user) {
        const dbUser = await ensureAuthUser(user, account);
        applyDbUserToToken(token, dbUser);
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
      // Credentials-type providers (email/password and email-code OTP) return
      // the user directly from authorize(); no need to call ensureAuthUser.
      // Non-credentials providers (Google OAuth, etc.) need account upsert.
      if (account?.type !== "credentials") {
        try {
          const dbUser = await ensureAuthUser(user, account);
          if (!dbUser) {
            console.error("[auth] signIn denied: ensureAuthUser returned null for", user.email);
            return false;
          }
          user.id = dbUser.id;
          if (!dbUser.isActive) {
            console.error("[auth] signIn denied: user is inactive", user.email);
          }
          return dbUser.isActive;
        } catch (error) {
          console.error("[auth] signIn error in ensureAuthUser:", error);
          return false;
        }
      }

      if (!user) return false;

      // Block deactivated credential users (covers both password and OTP paths)
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
