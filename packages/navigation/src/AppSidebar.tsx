"use client";

import * as React from "react";
import type { AppSidebarProps } from "./types";
import { cn } from "./utils";
import { useControlled } from "./hooks";
import { useNavState } from "./context";
import { AppNavMenu } from "./AppNavMenu";

/**
 * Vertical sidebar navigation with optional collapsible rail mode.
 */
export function AppSidebar({
  logo,
  navItems = [],
  header,
  footer,

  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  collapsible = false,
  rail = false,

  width = 260,
  collapsedWidth = 64,

  position = "left",
  bordered = true,
  elevated = false,

  currentPath,
  activeItemId,
  renderLink,
  renderItem,
  onNavigate,
  renderLogo,

  className,
  logoClassName,
  headerClassName,
  footerClassName,
  itemClassName,
  menuClassName,
}: AppSidebarProps) {
  const ctx = useNavState();

  const [isCollapsed, setCollapsed] = useControlled<boolean>({
    controlled: collapsed,
    default: defaultCollapsed,
    onChange: onCollapsedChange,
  });

  const w =
    isCollapsed && rail
      ? typeof collapsedWidth === "number"
        ? `${collapsedWidth}px`
        : collapsedWidth
      : typeof width === "number"
        ? `${width}px`
        : width;

  return (
    <aside
      className={cn(
        "asaf-nav-sidebar",
        `asaf-nav-sidebar--${position}`,
        isCollapsed && "asaf-nav-sidebar--collapsed",
        rail && "asaf-nav-sidebar--rail",
        bordered && "asaf-nav-sidebar--bordered",
        elevated && "asaf-nav-sidebar--elevated",
        className
      )}
      style={{ width: w }}
      aria-label="Sidebar navigation"
    >
      {(logo || header || collapsible) && (
        <div className={cn("asaf-nav-sidebar__header", headerClassName)}>
          {(renderLogo ? renderLogo() : logo) && (
            <div className={cn("asaf-nav-sidebar__logo", logoClassName)}>
              {renderLogo ? renderLogo() : logo}
            </div>
          )}
          {header}
          {collapsible && (
            <button
              type="button"
              className="asaf-nav-sidebar__collapse-btn"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              onClick={() => setCollapsed(!isCollapsed)}
            >
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                aria-hidden="true"
                className={cn(
                  "asaf-nav-sidebar__collapse-icon",
                  isCollapsed && "asaf-nav-sidebar__collapse-icon--collapsed"
                )}
              >
                <path
                  d="M6 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      )}
      <nav className="asaf-nav-sidebar__nav" aria-label="Sidebar">
        <AppNavMenu
          items={navItems}
          orientation="vertical"
          currentPath={currentPath ?? ctx.currentPath}
          activeItemId={activeItemId ?? ctx.activeItemId}
          renderLink={renderLink ?? ctx.renderLink}
          renderItem={renderItem}
          onNavigate={onNavigate ?? ctx.onNavigate}
          itemClassName={cn(
            isCollapsed && rail && "asaf-nav-item--icon-only",
            itemClassName
          )}
          menuClassName={menuClassName}
        />
      </nav>
      {footer && (
        <div className={cn("asaf-nav-sidebar__footer", footerClassName)}>{footer}</div>
      )}
    </aside>
  );
}
