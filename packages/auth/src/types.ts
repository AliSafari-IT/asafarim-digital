import type { DefaultSession } from "next-auth";

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
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    tenantId?: string | null;
  }
}
