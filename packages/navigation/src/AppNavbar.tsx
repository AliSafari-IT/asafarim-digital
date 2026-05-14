"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import type { AppNavbarProps } from "./types";
import { cn } from "./utils";
import { useControlled, useViewType } from "./hooks";
import { useNavState } from "./context";
import { AppNavMenu } from "./AppNavMenu";
import { AppDrawer } from "./AppDrawer";

/**
 * Responsive top navbar. On mobile (or when hamburgerMode is forced), the
 * primary nav collapses into a drawer triggered by the hamburger button.
 */
export function AppNavbar({
  logo,
  center,
  navItems = [],
  countryLangSelector,
  themeToggler,
  actions,

  viewType,
  responsiveMode = "auto",
  hamburgerMode,

  currentPath,
  activeItemId,

  sticky = true,
  elevated = false,
  bordered = true,
  compact = false,
  fullWidth = false,

  defaultOpen = false,
  open,
  onOpenChange,

  onNavigate,
  renderLink,
  renderLogo,
  renderActions,
  renderItem,

  className,
  logoClassName,
  navClassName,
  itemClassName,
  actionsClassName,
  menuClassName,
}: AppNavbarProps) {
  const ctx = useNavState();
  const detectedView = useViewType();
  const view = viewType ?? detectedView;

  const [isOpen, setOpen] = useControlled<boolean>({
    controlled: open,
    default: defaultOpen,
    onChange: onOpenChange,
  });

  // Decide whether to use hamburger / drawer.
  const useHamburger = (() => {
    if (responsiveMode === "always-expanded") return false;
    if (responsiveMode === "always-collapsed") return true;
    if (typeof hamburgerMode === "boolean") return hamburgerMode;
    // auto: show hamburger on mobile + tablet
    return view !== "desktop";
  })();

  // Close drawer when route changes
  useEffect(() => {
    if (isOpen) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const headerClasses = cn(
    "asaf-nav-navbar",
    sticky && "asaf-nav-navbar--sticky",
    elevated && "asaf-nav-navbar--elevated",
    bordered && "asaf-nav-navbar--bordered",
    compact && "asaf-nav-navbar--compact",
    className
  );

  const containerClasses = cn(
    "asaf-nav-navbar__container",
    fullWidth && "asaf-nav-navbar__container--full"
  );

  const logoNode = renderLogo ? renderLogo() : logo;
  const actionsNode = renderActions ? renderActions() : actions;

  return (
    <>
      <header className={headerClasses} role="banner">
        <div className={containerClasses}>
          <div className={cn("asaf-nav-navbar__logo", logoClassName)}>{logoNode}</div>

          {!useHamburger && (
            <nav
              className={cn("asaf-nav-navbar__nav", navClassName)}
              aria-label="Primary"
            >
              <AppNavMenu
                items={navItems}
                orientation="horizontal"
                currentPath={currentPath ?? ctx.currentPath}
                activeItemId={activeItemId ?? ctx.activeItemId}
                renderLink={renderLink ?? ctx.renderLink}
                renderItem={renderItem}
                onNavigate={onNavigate ?? ctx.onNavigate}
                itemClassName={itemClassName}
                menuClassName={menuClassName}
              />
            </nav>
          )}

          {center && <div className="asaf-nav-navbar__center">{center}</div>}

          <div className={cn("asaf-nav-navbar__actions", actionsClassName)}>
            {countryLangSelector && (
              <div className="asaf-nav-navbar__action-slot">{countryLangSelector}</div>
            )}
            {themeToggler && (
              <div className="asaf-nav-navbar__action-slot">{themeToggler}</div>
            )}
            {actionsNode && (
              <div className="asaf-nav-navbar__action-slot">{actionsNode}</div>
            )}

            {useHamburger && (
              <button
                type="button"
                className="asaf-nav-navbar__hamburger"
                aria-label={isOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={isOpen}
                aria-controls="asaf-nav-drawer"
                onClick={() => setOpen(!isOpen)}
              >
                <span className="asaf-nav-navbar__hamburger-bar" />
                <span className="asaf-nav-navbar__hamburger-bar" />
                <span className="asaf-nav-navbar__hamburger-bar" />
              </button>
            )}
          </div>
        </div>
      </header>

      {useHamburger && (
        <AppDrawer
          open={isOpen}
          onOpenChange={setOpen}
          navItems={navItems}
          logo={logoNode}
          currentPath={currentPath ?? ctx.currentPath}
          activeItemId={activeItemId ?? ctx.activeItemId}
          renderLink={renderLink ?? ctx.renderLink}
          renderItem={renderItem}
          onNavigate={onNavigate ?? ctx.onNavigate}
          itemClassName={itemClassName}
          menuClassName={menuClassName}
          ariaLabel="Primary"
        />
      )}
    </>
  );
}
