// ─────────────────────────────────────────────────────────────
// Types used by the `resolveNavigation` server-side resolver.
//
// These were originally consumed from `@asafarim/types`, but to keep this
// package publishable to npm with no private workspace dependencies, they
// are inlined here. They are intentionally a superset that matches the
// monorepo's `NavItemDto` shape, so resolver users in the monorepo remain
// drop-in compatible.
// ─────────────────────────────────────────────────────────────

/** Generic app code. Open string so external consumers aren't constrained. */
export type AppCode = string;

/** "all" wildcard or a specific app code. */
export type NavAppScope = "all" | (string & {});

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
