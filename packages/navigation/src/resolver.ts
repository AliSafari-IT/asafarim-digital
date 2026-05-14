import type {
  AppCode,
  NavAppScope,
  NavItemDto,
  ResolveNavigationInput,
  ResolveNavigationOutput,
  ResolvedNavItem,
} from "./resolver-types";

export type {
  AppCode,
  NavAppScope,
  NavItemDto,
  NavPlacement,
  NavVisibility,
  ResolveNavigationInput,
  ResolveNavigationOutput,
  ResolvedNavItem,
} from "./resolver-types";

/**
 * Resolves navigation items for a specific app context.
 * Filters by app scope, placement, visibility, and user permissions.
 */
export function resolveNavigation(input: ResolveNavigationInput): ResolveNavigationOutput {
  const { items, currentApp, user, placement, group } = input;

  // Step 1: Filter by isActive
  let filtered = items.filter((item) => item.isActive);

  // Step 2: Filter by appScope (must include "all" or currentApp)
  filtered = filtered.filter((item) => {
    const scopes: NavAppScope[] = item.appScope?.length ? item.appScope : ["all"];
    return scopes.includes("all") || scopes.includes(currentApp as AppCode);
  });

  // Step 3: Filter by placement and group
  if (placement) {
    filtered = filtered.filter((item) => item.placement === placement);
  }
  if (group) {
    filtered = filtered.filter((item) => item.group === group);
  }

  // Step 4: Apply visibility rules
  filtered = filtered.filter((item) => {
    switch (item.visibility) {
      case "public":
        return true;
      case "authenticated":
        return user?.authenticated ?? false;
      case "role": {
        if (!user?.authenticated) return false;
        const hasRequiredRole = item.requiredRole ? user.roles.includes(item.requiredRole) : true;
        const hasRequiredPermissions =
          item.requiredPermissions.length === 0 ||
          item.requiredPermissions.every((perm) => user.permissions.includes(perm));
        return hasRequiredRole && hasRequiredPermissions;
      }
      default:
        return true;
    }
  });

  // Step 5: Build tree structure and remove parents with no visible children
  const itemMap = new Map<string, ResolvedNavItem>();
  const rootItems: ResolvedNavItem[] = [];

  // First pass: create resolved items
  filtered.forEach((item) => {
    itemMap.set(item.id, {
      ...item,
      resolvedHref: item.href,
      isVisible: true,
      children: [],
    });
  });

  // Second pass: build parent-child relationships
  filtered.forEach((item) => {
    const resolved = itemMap.get(item.id)!;
    if (item.parentId && itemMap.has(item.parentId)) {
      const parent = itemMap.get(item.parentId)!;
      parent.children = parent.children || [];
      parent.children.push(resolved);
    } else {
      rootItems.push(resolved);
    }
  });

  // Step 6: Sort by group, position, then label
  const sortItems = (a: ResolvedNavItem, b: ResolvedNavItem): number => {
    // First by group
    if (a.group !== b.group) {
      return a.group.localeCompare(b.group);
    }
    // Then by position
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    // Finally by label
    return a.label.localeCompare(b.label);
  };

  rootItems.sort(sortItems);
  rootItems.forEach((item) => {
    if (item.children && item.children.length > 0) {
      item.children.sort(sortItems);
    }
  });

  // Collect all groups
  const groups = [...new Set(filtered.map((item) => item.group))].sort();

  return {
    items: rootItems,
    groups,
    totalCount: items.length,
    visibleCount: filtered.length,
  };
}

/**
 * Flattens a tree of navigation items into a single array.
 */
export function flattenNavigation(items: ResolvedNavItem[]): ResolvedNavItem[] {
  const result: ResolvedNavItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result.push(...flattenNavigation(item.children));
    }
  }
  return result;
}

/**
 * Resolves cross-app URLs using metadata.appTarget.
 * Returns the full URL for cross-app navigation.
 */
export function resolveCrossAppUrl(
  item: NavItemDto,
  appUrls: Record<string, string>
): string {
  // If it's an external URL, return as-is
  if (item.href.startsWith("http://") || item.href.startsWith("https://")) {
    return item.href;
  }

  // Check if metadata has appTarget for cross-app navigation
  const metadata = item.metadata as { appTarget?: string } | null;
  if (metadata?.appTarget && appUrls[metadata.appTarget]) {
    const baseUrl = appUrls[metadata.appTarget];
    const path = item.href.startsWith("/") ? item.href : `/${item.href}`;
    return `${baseUrl}${path}`;
  }

  // Return original href for internal navigation
  return item.href;
}
