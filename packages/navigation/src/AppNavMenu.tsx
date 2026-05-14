"use client";

import * as React from "react";
import type { AppNavMenuProps } from "./types";
import { cn, itemKey } from "./utils";
import { useNavState } from "./context";
import { AppNavItem } from "./AppNavItem";

/**
 * Renders a flat or nested list of NavItem nodes as a UL.
 * Horizontal orientation is intended for topbar; vertical for sidebar/drawer.
 */
export function AppNavMenu({
  items,
  orientation = "horizontal",
  currentPath,
  activeItemId,
  renderLink,
  renderItem,
  onNavigate,
  className,
  itemClassName,
  menuClassName,
  depth = 0,
}: AppNavMenuProps) {
  const ctx = useNavState();
  const cp = currentPath ?? ctx.currentPath;
  const aid = activeItemId ?? ctx.activeItemId;
  const rl = renderLink ?? ctx.renderLink;
  const onNav = onNavigate ?? ctx.onNavigate;

  return (
    <ul
      role="list"
      className={cn(
        "asaf-nav-menu",
        orientation === "horizontal"
          ? "asaf-nav-menu--horizontal"
          : "asaf-nav-menu--vertical",
        className
      )}
    >
      {items.map((item, idx) => (
        <AppNavItem
          key={itemKey(item, idx)}
          item={item}
          depth={depth}
          orientation={orientation}
          currentPath={cp}
          activeItemId={aid}
          renderLink={rl}
          renderItem={renderItem}
          onNavigate={onNav}
          itemClassName={itemClassName}
          menuClassName={menuClassName}
        />
      ))}
    </ul>
  );
}
