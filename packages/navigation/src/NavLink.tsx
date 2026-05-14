"use client";

import * as React from "react";
import type { NavItem, RenderLink } from "./types";
import { cn, externalLinkProps } from "./utils";

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  disabled?: boolean;
  renderLink?: RenderLink;
  onNavigate?: (item: NavItem) => void;
  className?: string;
  children: React.ReactNode;
};

/**
 * Renders the underlying anchor element using either the consumer-provided
 * `renderLink` adapter or a native `<a>` fallback. Centralizes a11y/click
 * handling so all surfaces behave the same.
 */
export function NavLink({
  item,
  active,
  disabled,
  renderLink,
  onNavigate,
  className,
  children,
}: NavLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    item.onClick?.(e);
    if (!e.defaultPrevented) {
      onNavigate?.(item);
    }
  };

  // Consumer-provided link adapter (React Router, Next.js Link, etc.)
  if (renderLink) {
    return (
      <span
        className={cn(className)}
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
        aria-disabled={disabled || undefined}
      >
        {renderLink({ item, active, disabled: !!disabled, children })}
      </span>
    );
  }

  // Disabled items render as non-interactive span (not focusable).
  if (disabled) {
    return (
      <span
        className={cn(className, "asaf-nav-link", "asaf-nav-link--disabled")}
        aria-disabled="true"
      >
        {children}
      </span>
    );
  }

  // Items without an href and not disabled act as buttons.
  if (!item.href) {
    return (
      <button
        type="button"
        className={cn(className, "asaf-nav-link")}
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </button>
    );
  }

  return (
    <a
      href={item.href}
      className={cn(className, "asaf-nav-link", active && "asaf-nav-link--active")}
      onClick={handleClick}
      aria-current={active ? "page" : undefined}
      {...externalLinkProps(item)}
    >
      {children}
    </a>
  );
}
