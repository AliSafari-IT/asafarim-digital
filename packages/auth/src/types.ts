import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

/**
 * Extend Auth.js types to include role and tenant.
 *
 * Each app should reference this file in their next-auth.d.ts:
 *
 * ```ts
 * // apps/portal/types/next-auth.d.ts
 * export type { } from "@asafarim/auth/types";
 * ```
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      tenantId: string | null;
      username: string | null;
      emailVerified: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    tenantId?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: string;
    tenantId?: string | null;
    username?: string | null;
    emailVerified?: string | null;
  }
}
