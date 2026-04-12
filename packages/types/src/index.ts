// Shared types across the asafarim-digital ecosystem

export type Environment = "development" | "qa" | "staging" | "production";

export type ServiceStatus = "operational" | "degraded" | "down" | "coming-soon";

export interface ServiceInfo {
  name: string;
  status: ServiceStatus;
  version?: string;
  url?: string;
}

export interface AppInfo {
  name: string;
  description: string;
  href: string;
  status: ServiceStatus;
  icon: string;
}

// ─── Auth & Multi-Tenant Types ─────────────────────────────
// These mirror the Prisma schema enums in @asafarim/db.
// For database operations, use the Prisma-generated types directly.
// These are for UI/API contracts that don't depend on Prisma.

export type UserRole = "ADMIN" | "DEVELOPER" | "VIEWER";

export type TenantPlan = "FREE" | "PRO" | "ENTERPRISE";

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  tenantId: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: TenantPlan;
}
