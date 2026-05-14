import type { NavItem } from "./types";

/** Tiny classname joiner. Filters out falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** True when no path matters and item.active === true, or activeItemId matches, or href matches currentPath. */
export function isItemActive(
  item: NavItem,
  options: { currentPath?: string; activeItemId?: string }
): boolean {
  if (item.active === true) return true;
  if (options.activeItemId && options.activeItemId === item.id) return true;
  if (options.currentPath && item.href) {
    if (item.href === "/") return options.currentPath === "/";
    // Match exact or as a path prefix followed by '/'
    return (
      options.currentPath === item.href ||
      options.currentPath.startsWith(item.href + "/")
    );
  }
  return false;
}

/** True when any descendant (recursive) of item is active. */
export function isBranchActive(
  item: NavItem,
  options: { currentPath?: string; activeItemId?: string }
): boolean {
  if (isItemActive(item, options)) return true;
  if (!item.children || item.children.length === 0) return false;
  return item.children.some((child) => isBranchActive(child, options));
}

/**
 * Filter a tree of NavItems by user roles + permissions.
 * - An item with no requiredRoles AND no permissions is always visible.
 * - Otherwise: user must have ALL listed permissions AND at least one of the
 *   listed roles (if requiredRoles is non-empty).
 * Parents whose children are all hidden remain visible only if they have their
 * own href (i.e., act as a leaf link).
 */
export function filterNavByRoles(
  items: NavItem[],
  userRoles: string[] = [],
  userPermissions: string[] = []
): NavItem[] {
  const rolesSet = new Set(userRoles);
  const permsSet = new Set(userPermissions);

  const visit = (item: NavItem): NavItem | null => {
    const needsRoles = (item.requiredRoles?.length ?? 0) > 0;
    const needsPerms = (item.permissions?.length ?? 0) > 0;
    const rolesOk = !needsRoles || item.requiredRoles!.some((r) => rolesSet.has(r));
    const permsOk =
      !needsPerms || item.permissions!.every((p) => permsSet.has(p));
    if (!rolesOk || !permsOk) return null;

    const children = (item.children ?? [])
      .map(visit)
      .filter((c): c is NavItem => c !== null);

    if (children.length === 0 && (item.children?.length ?? 0) > 0 && !item.href) {
      // Parent with no remaining visible children and no own link → hide.
      return null;
    }

    return children.length > 0 || item.children
      ? { ...item, children }
      : { ...item };
  };

  return items.map(visit).filter((c): c is NavItem => c !== null);
}

/** External link safe attributes. */
export function externalLinkProps(item: NavItem) {
  if (!item.external) return {};
  return { target: "_blank", rel: "noopener noreferrer" as const };
}

/** Stable key for a nav item (fallback to label + index). */
export function itemKey(item: NavItem, index: number): string {
  return item.id || `${item.label}-${index}`;
}
