// Navigation types for shared navbar system across all ASafariM apps

export const APP_CODES = [
  "portal",
  "content-generator",
  "ops-hub",
  "marketing-content",
  "edumatch",
] as const;

export type AppCode = (typeof APP_CODES)[number];
export type NavAppScope = "all" | AppCode;

export type NavVisibility = "public" | "authenticated" | "role";
export type NavPlacement = "header" | "sidebar" | "footer" | "command";

export interface NavItemDto {
  id: string;
  label: string;
  labelKey?: string | null;
  href: string;
  position: number;
  visibility: NavVisibility;
  requiredRole?: string | null;
  requiredPermissions: string[];
  appScope: NavAppScope[];
  parentId?: string | null;
  isActive: boolean;
  icon?: string | null;
  target?: string | null;
  group: string;
  placement: NavPlacement;
  metadata?: Record<string, unknown> | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  children?: NavItemDto[];
}

export interface ResolvedNavItem extends NavItemDto {
  resolvedHref: string;
  isVisible: boolean;
  children?: ResolvedNavItem[];
}

export interface ResolveNavigationInput {
  items: NavItemDto[];
  currentApp: AppCode;
  user?: {
    authenticated: boolean;
    roles: string[];
    permissions: string[];
  };
  placement?: NavPlacement;
  group?: string;
}

export interface ResolveNavigationOutput {
  items: ResolvedNavItem[];
  groups: string[];
  totalCount: number;
  visibleCount: number;
}
