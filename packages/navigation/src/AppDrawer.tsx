"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import type { AppDrawerProps } from "./types";
import { cn } from "./utils";
import { useBodyScrollLock, useFocusTrap } from "./hooks";
import { AppNavMenu } from "./AppNavMenu";

/**
 * Slide-in drawer with backdrop. Controlled component.
 *
 * Accessibility:
 * - role="dialog", aria-modal="true"
 * - Escape closes (configurable)
 * - Focus is trapped inside the drawer while open
 * - Body scroll is locked
 */
export function AppDrawer({
  open,
  onOpenChange,
  side = "left",
  width = 320,
  navItems = [],
  logo,
  header,
  footer,
  currentPath,
  activeItemId,
  renderLink,
  renderItem,
  onNavigate,
  lockScroll = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  ariaLabel = "Navigation",
  className,
  headerClassName,
  footerClassName,
  backdropClassName,
  menuClassName,
  itemClassName,
}: AppDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open && lockScroll);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEscape, onOpenChange]);

  if (!open) return null;

  return (
    <div className="asaf-nav-drawer-root" data-state={open ? "open" : "closed"}>
      <div
        className={cn("asaf-nav-drawer__backdrop", backdropClassName)}
        onClick={closeOnBackdrop ? () => onOpenChange(false) : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "asaf-nav-drawer",
          `asaf-nav-drawer--${side}`,
          className
        )}
        style={{ width: typeof width === "number" ? `${width}px` : width }}
      >
        {(logo || header) && (
          <div className={cn("asaf-nav-drawer__header", headerClassName)}>
            {logo && <div className="asaf-nav-drawer__logo">{logo}</div>}
            {header}
            <button
              type="button"
              className="asaf-nav-drawer__close"
              aria-label="Close navigation"
              onClick={() => onOpenChange(false)}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path
                  d="M3 3l10 10M13 3L3 13"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        <nav className="asaf-nav-drawer__nav" aria-label={ariaLabel}>
          <AppNavMenu
            items={navItems}
            orientation="vertical"
            currentPath={currentPath}
            activeItemId={activeItemId}
            renderLink={renderLink}
            renderItem={renderItem}
            onNavigate={(it) => {
              onNavigate?.(it);
              onOpenChange(false);
            }}
            itemClassName={itemClassName}
            menuClassName={menuClassName}
          />
        </nav>
        {footer && (
          <div className={cn("asaf-nav-drawer__footer", footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
