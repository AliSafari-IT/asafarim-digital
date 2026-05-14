"use client";

import * as React from "react";
import { useState } from "react";
import type { NavItem, RenderLink, RenderItem } from "./types";
import { cn } from "./utils";
import { isItemActive, isBranchActive, itemKey } from "./utils";
import { NavLink } from "./NavLink";

type Orientation = "horizontal" | "vertical";

type AppNavItemProps = {
  item: NavItem;
  depth: number;
  orientation: Orientation;
  currentPath?: string;
  activeItemId?: string;
  renderLink?: RenderLink;
  renderItem?: RenderItem;
  onNavigate?: (item: NavItem) => void;
  itemClassName?: string;
  menuClassName?: string;
  /** Render only icons (sidebar collapsed rail). */
  iconOnly?: boolean;
};

/**
 * Renders a single nav item plus its children (if any) as a disclosure.
 * Shared by AppNavMenu, AppSidebar (vertical), and AppDrawer (vertical).
 */
export function AppNavItem({
  item,
  depth,
  orientation,
  currentPath,
  activeItemId,
  renderLink,
  renderItem,
  onNavigate,
  itemClassName,
  menuClassName,
  iconOnly,
}: AppNavItemProps) {
  const hasChildren = !!item.children && item.children.length > 0;
  const active = isItemActive(item, { currentPath, activeItemId });
  const branchActive = hasChildren && isBranchActive(item, { currentPath, activeItemId });
  const [openSubmenu, setOpenSubmenu] = useState<boolean>(branchActive);

  // Allow consumer to fully override item rendering
  if (renderItem) {
    return <>{renderItem({ item, active, depth })}</>;
  }

  const labelNode = (
    <>
      {item.icon && (
        <span className="asaf-nav-item__icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      {!iconOnly && (
        <span className="asaf-nav-item__label">
          <span className="asaf-nav-item__label-text">{item.label}</span>
          {item.description && (
            <span className="asaf-nav-item__description">{item.description}</span>
          )}
        </span>
      )}
      {!iconOnly && item.shortcut && (
        <kbd className="asaf-nav-item__shortcut">{item.shortcut}</kbd>
      )}
      {!iconOnly && item.badge && (
        <span className="asaf-nav-item__badge">{item.badge}</span>
      )}
      {!iconOnly && item.endIcon && (
        <span className="asaf-nav-item__end-icon" aria-hidden="true">
          {item.endIcon}
        </span>
      )}
    </>
  );

  const linkClasses = cn(
    "asaf-nav-item",
    `asaf-nav-item--depth-${depth}`,
    active && "asaf-nav-item--active",
    branchActive && "asaf-nav-item--branch-active",
    item.disabled && "asaf-nav-item--disabled",
    iconOnly && "asaf-nav-item--icon-only",
    itemClassName
  );

  if (!hasChildren) {
    return (
      <li className="asaf-nav-li" role="none" title={iconOnly ? item.label : undefined}>
        <NavLink
          item={item}
          active={active}
          disabled={item.disabled}
          renderLink={renderLink}
          onNavigate={onNavigate}
          className={linkClasses}
        >
          {labelNode}
        </NavLink>
      </li>
    );
  }

  // With children → render disclosure
  const submenuId = `asaf-submenu-${item.id || depth}-${item.label}`.replace(/\s+/g, "-");

  return (
    <li className="asaf-nav-li asaf-nav-li--has-children" role="none">
      <div className="asaf-nav-item-row">
        {/* If item has its own href, the link is still navigable; toggle is separate. */}
        {item.href ? (
          <NavLink
            item={item}
            active={active}
            disabled={item.disabled}
            renderLink={renderLink}
            onNavigate={onNavigate}
            className={linkClasses}
          >
            {labelNode}
          </NavLink>
        ) : (
          <button
            type="button"
            className={linkClasses}
            aria-expanded={openSubmenu}
            aria-controls={submenuId}
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled || undefined}
            onClick={() => setOpenSubmenu((v) => !v)}
          >
            {labelNode}
          </button>
        )}
        <button
          type="button"
          className="asaf-nav-item__toggle"
          aria-expanded={openSubmenu}
          aria-controls={submenuId}
          aria-label={`${openSubmenu ? "Collapse" : "Expand"} ${item.label}`}
          onClick={() => setOpenSubmenu((v) => !v)}
        >
          <svg
            className={cn(
              "asaf-nav-item__chevron",
              openSubmenu && "asaf-nav-item__chevron--open"
            )}
            viewBox="0 0 12 12"
            width="12"
            height="12"
            aria-hidden="true"
          >
            <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
      {openSubmenu && !iconOnly && (
        <ul
          id={submenuId}
          className={cn("asaf-nav-submenu", menuClassName)}
          role="list"
        >
          {item.children!.map((child, idx) => (
            <AppNavItem
              key={itemKey(child, idx)}
              item={child}
              depth={depth + 1}
              orientation={orientation}
              currentPath={currentPath}
              activeItemId={activeItemId}
              renderLink={renderLink}
              renderItem={renderItem}
              onNavigate={onNavigate}
              itemClassName={itemClassName}
              menuClassName={menuClassName}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
