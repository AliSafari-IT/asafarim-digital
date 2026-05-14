import type * as React from "react";

/* ─────────────────────────── Core Types ─────────────────────────── */

export type ViewType = "mobile" | "tablet" | "desktop";

export type NavVariant =
  | "topbar"
  | "sidebar"
  | "drawer"
  | "dropdown"
  | "rail"
  | "tabs";

export type ResponsiveMode =
  | "auto"
  | "always-expanded"
  | "always-collapsed"
  | "manual";

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  external?: boolean;
  badge?: React.ReactNode;
  description?: string;
  shortcut?: string;
  children?: NavItem[];
  requiredRoles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
  onClick?: (event: React.MouseEvent) => void;
};

/* ─────────────────────────── Render Helpers ─────────────────────────── */

export type RenderLinkProps = {
  item: NavItem;
  active: boolean;
  disabled: boolean;
  children: React.ReactNode;
};

export type RenderLink = (props: RenderLinkProps) => React.ReactNode;

export type RenderItemProps = {
  item: NavItem;
  active: boolean;
  depth: number;
};

export type RenderItem = (props: RenderItemProps) => React.ReactNode;

/* ─────────────────────────── Shared Props ─────────────────────────── */

export type CommonNavProps = {
  navItems?: NavItem[];
  currentPath?: string;
  activeItemId?: string;
  onNavigate?: (item: NavItem) => void;
  renderLink?: RenderLink;
  renderItem?: RenderItem;
  className?: string;
  itemClassName?: string;
  menuClassName?: string;
};

/* ─────────────────────────── Navbar ─────────────────────────── */

export type AppNavbarProps = CommonNavProps & {
  logo?: React.ReactNode;
  /**
   * Optional center slot. Absolutely centered within the navbar container so
   * it stays in the visual middle regardless of how much room the logo / nav /
   * actions take. Hidden on narrow viewports (<1024px) to avoid overlap.
   * Typical use: a global search / command-palette trigger.
   */
  center?: React.ReactNode;
  countryLangSelector?: React.ReactNode;
  themeToggler?: React.ReactNode;
  actions?: React.ReactNode;

  variant?: "topbar";
  viewType?: ViewType;
  responsiveMode?: ResponsiveMode;
  hamburgerMode?: boolean;

  sticky?: boolean;
  elevated?: boolean;
  bordered?: boolean;
  compact?: boolean;
  fullWidth?: boolean;

  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  renderLogo?: () => React.ReactNode;
  renderActions?: () => React.ReactNode;

  logoClassName?: string;
  navClassName?: string;
  actionsClassName?: string;
};

/* ─────────────────────────── Sidebar ─────────────────────────── */

export type AppSidebarProps = CommonNavProps & {
  logo?: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;

  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  collapsible?: boolean;

  /** Rail mode renders only icons when collapsed. */
  rail?: boolean;

  width?: number | string;
  collapsedWidth?: number | string;

  position?: "left" | "right";
  bordered?: boolean;
  elevated?: boolean;

  renderLogo?: () => React.ReactNode;

  logoClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
};

/* ─────────────────────────── Drawer ─────────────────────────── */

export type AppDrawerProps = CommonNavProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  side?: "left" | "right";
  width?: number | string;

  logo?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;

  /** Lock body scroll while open. Defaults to true. */
  lockScroll?: boolean;
  /** Close on Escape. Defaults to true. */
  closeOnEscape?: boolean;
  /** Close on backdrop click. Defaults to true. */
  closeOnBackdrop?: boolean;

  ariaLabel?: string;

  headerClassName?: string;
  footerClassName?: string;
  backdropClassName?: string;
};

/* ─────────────────────────── Dropdown ─────────────────────────── */

export type AppNavDropdownProps = {
  trigger: React.ReactNode;
  items: NavItem[];
  currentPath?: string;
  activeItemId?: string;
  onNavigate?: (item: NavItem) => void;
  renderLink?: RenderLink;
  align?: "start" | "end" | "center";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Open on hover (desktop only). Keyboard remains primary interaction. */
  openOnHover?: boolean;
  ariaLabel?: string;
  className?: string;
  menuClassName?: string;
  itemClassName?: string;
  triggerClassName?: string;
};

/* ─────────────────────────── Menu (Generic) ─────────────────────────── */

export type AppNavMenuProps = CommonNavProps & {
  items: NavItem[];
  orientation?: "horizontal" | "vertical";
  /** Initial depth (used internally for nested rendering). */
  depth?: number;
};

/* ─────────────────────────── Provider ─────────────────────────── */

export type NavProviderProps = {
  children: React.ReactNode;
  currentPath?: string;
  activeItemId?: string;
  renderLink?: RenderLink;
  onNavigate?: (item: NavItem) => void;
  /** Optional roles + permissions used by filterNavByRoles helper. */
  userRoles?: string[];
  userPermissions?: string[];
};

export type NavContextValue = {
  currentPath?: string;
  activeItemId?: string;
  renderLink?: RenderLink;
  onNavigate?: (item: NavItem) => void;
  userRoles: string[];
  userPermissions: string[];
};
