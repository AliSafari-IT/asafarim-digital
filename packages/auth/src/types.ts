import type { DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

/**
 * Extend Auth.js types to include RBAC roles and tenant.
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
      roles: string[];
      tenantId: string | null;
      username: string | null;
      emailVerified: string | null;
      isActive: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    roles?: string[];
    tenantId?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
    isActive?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    roles?: string[];
    tenantId?: string | null;
    username?: string | null;
    emailVerified?: string | null;
    isActive?: boolean;
  }
}
