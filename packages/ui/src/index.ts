// Shared UI components — add components here as the platform grows
export { Button } from "./button";
export { UserMenu } from "./user-menu";
export { AppSwitcher } from "./app-switcher";
export { useOutsideClick } from "./use-outside-click";
export { Avatar } from "./avatar";
export type { AvatarProps } from "./avatar";
export { asafarimBrandTokens, asafarimTailwindThemeExtension } from "./brand-tokens";
export type { AppKey, AppVisibility } from "./app-switcher";
export { apps, filterAppsByRoles } from "./app-switcher";
export { applyTheme, initializeTheme, persistTheme, readTheme, THEME_STORAGE_KEY, themeInitScript } from "./theme";
export type { Theme } from "./theme";
export { subscribeThemeChanges } from "./theme";
export { readThemeFromCookie } from "./theme";

// ─── Navigation Components ─────────────────────────────────
export { CommonNavbar, useNavigation } from "./common-navbar";
export { CommonSidebar, SidebarLayout } from "./common-sidebar";
export { NAV_ICON_MAP, getNavIcon, DEFAULT_NAV_ICON } from "./nav-icons";
export * from "./nav-icons";
