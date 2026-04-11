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

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "developer" | "viewer";
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
}
