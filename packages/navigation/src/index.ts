// ─────────────────────────────────────────────────────────────
// @asafarim/navigation — public API
// ─────────────────────────────────────────────────────────────

// Resolver utilities (server-side / data-driven nav)
export * from "./resolver";
export type * from "./resolver-types";

// React components
export { AppNavbar } from "./AppNavbar";
export { AppSidebar } from "./AppSidebar";
export { AppDrawer } from "./AppDrawer";
export { AppNavDropdown } from "./AppNavDropdown";
export { AppNavMenu } from "./AppNavMenu";
export { AppNavItem } from "./AppNavItem";
export { NavLink } from "./NavLink";

// Context + hooks
export { NavProvider, useNavState } from "./context";
export {
  useViewType,
  useOutsideClick,
  useControlled,
  useBodyScrollLock,
  useFocusTrap,
} from "./hooks";

// Utilities
export {
  cn,
  isItemActive,
  isBranchActive,
  filterNavByRoles,
  externalLinkProps,
} from "./utils";

// Types
export type {
  ViewType,
  NavVariant,
  ResponsiveMode,
  NavItem,
  RenderLink,
  RenderLinkProps,
  RenderItem,
  RenderItemProps,
  CommonNavProps,
  AppNavbarProps,
  AppSidebarProps,
  AppDrawerProps,
  AppNavDropdownProps,
  AppNavMenuProps,
  NavProviderProps,
  NavContextValue,
} from "./types";
