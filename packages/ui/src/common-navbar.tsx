"use client";

import React, { useState, useEffect, useCallback, startTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ResolvedNavItem, AppCode } from "@asafarim/types";
import { getNavIcon } from "./nav-icons";

interface CommonNavbarProps {
  items: ResolvedNavItem[];
  app: AppCode;
  logo?: React.ReactNode;
  /**
   * Full right-side content shown on desktop navbar rail.
   * On mobile (<lg) this moves into the hamburger drawer.
   */
  rightContent?: React.ReactNode;
  /**
   * Controls permanently pinned in the bar at every viewport width —
   * language selector, theme toggle, etc. Never collapse into the drawer.
   */
  compactControls?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function CommonNavbar({
  items,
  app,
  logo,
  rightContent,
  compactControls,
  className = "",
  sticky = true,
}: CommonNavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  // Defer drawer-close so that <Link>'s router.push() (a React transition) can
  // commit *before* React unmounts the drawer. Otherwise the urgent setOpen(false)
  // tears down the Link mid-event and the navigation never completes — the menu
  // just collapses on item click. Wrapping in startTransition lowers our update
  // to the same priority lane as the navigation so they batch together.
  const closeDeferred = useCallback(() => {
    startTransition(() => setOpen(false));
  }, []);

  // Close drawer on route change
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Close drawer on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const headerItems = items.filter(
    (item) =>
      !item.parentId && (!item.placement || item.placement === "header"),
  );

  // The hamburger is only useful when there's something to show in the drawer.
  // rightContent (user menu / app-switcher) is always present, so the drawer
  // always has at least that. But if the user is logged-out the rightContent
  // slot might just be a "Sign in" link that fits in the bar — in that case
  // we still show the hamburger so the nav items are reachable. We let the
  // parent decide by passing rightContent or not.
  // Key insight: show the hamburger ONLY when there are nav items OR rightContent.
  const hasDrawerContent = headerItems.length > 0 || !!rightContent;

  // ── Desktop nav item ──────────────────────────────────────────────────────
  const renderDesktopItem = (item: ResolvedNavItem) => {
    const Icon = getNavIcon(item.icon);
    const active = isActive(item.resolvedHref || item.href);
    const cls = [
      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150",
      active
        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
    ].join(" ");

    if (item.children?.length) {
      return (
        <div key={item.id} className="relative group">
          <button className={cls}>
            <Icon />
            <span>{item.label}</span>
            <svg
              className="w-3.5 h-3.5 ml-0.5 transition-transform duration-150 group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <div className="absolute top-full left-0 mt-2 min-w-[180px] py-1.5 bg-[var(--color-panel)] border border-[var(--color-border-strong)] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            {item.children.map((c) => renderDesktopItem(c))}
          </div>
        </div>
      );
    }
    if (item.target === "_blank" || item.href.startsWith("http")) {
      return (
        <a
          key={item.id}
          href={item.resolvedHref || item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
        >
          <Icon />
          <span>{item.label}</span>
        </a>
      );
    }
    return (
      <Link key={item.id} href={item.resolvedHref || item.href} className={cls}>
        <Icon />
        <span>{item.label}</span>
      </Link>
    );
  };

  // ── Mobile nav item ───────────────────────────────────────────────────────
  const renderMobileItem = (item: ResolvedNavItem) => {
    const Icon = getNavIcon(item.icon);
    const active = isActive(item.resolvedHref || item.href);
    const cls = [
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150",
      active
        ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]",
    ].join(" ");

    if (item.children?.length) {
      return (
        <div key={item.id}>
          <span className={`${cls} opacity-50 cursor-default`}>
            <Icon />
            <span>{item.label}</span>
          </span>
          <div className="ml-4 border-l border-[var(--color-border)] pl-3 space-y-0.5 mt-0.5">
            {item.children.map((c) => renderMobileItem(c))}
          </div>
        </div>
      );
    }
    if (item.target === "_blank" || item.href.startsWith("http")) {
      return (
        <a
          key={item.id}
          href={item.resolvedHref || item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          onClick={close}
        >
          <Icon />
          <span>{item.label}</span>
        </a>
      );
    }
    return (
      <Link
        key={item.id}
        href={item.resolvedHref || item.href}
        className={cls}
        onClick={closeDeferred}
      >
        <Icon />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* ── Navbar bar ────────────────────────────────────────────────────── */}
      <header
        className={[
          "w-full",
          sticky ? "sticky top-0 z-50" : "",
          className,
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              {logo ?? (
                <Link
                  href="/"
                  className="text-xl font-bold text-[var(--color-text)]"
                >
                  {app.charAt(0).toUpperCase() +
                    app.slice(1).replace(/-/g, " ")}
                </Link>
              )}
            </div>

            {/* Desktop nav — only visible lg+ */}
            <nav
              className="hidden lg:flex flex-1 items-center gap-0.5 px-4 min-w-0"
              aria-label="Main navigation"
            >
              {headerItems.map(renderDesktopItem)}
            </nav>

            {/* Right group — always flex, never wraps */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Language + theme toggle — always in the bar */}
              {compactControls && (
                <div className="flex items-center gap-1.5">
                  {compactControls}
                </div>
              )}

              {/* App-switcher + user-menu — only on desktop */}
              {rightContent && (
                <div className="hidden lg:flex items-center gap-2">
                  {rightContent}
                </div>
              )}

              {/*
               * Hamburger — only rendered when:
               *   (a) we are below the lg breakpoint  (lg:hidden)
               *   (b) AND the drawer would have content to show
               * When the user is logged out and there are no nav items,
               * we skip the hamburger entirely — nothing to reveal.
               */}
              {hasDrawerContent && (
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  aria-label={open ? "Close menu" : "Open menu"}
                  aria-expanded={open}
                  aria-controls="nav-drawer"
                  className="lg:hidden inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {open ? (
                      <>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </>
                    ) : (
                      <>
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                      </>
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer — only mounted when open ────────────────────────── */}
      {open && (
        <>
          {/*
           * Backdrop — closes the drawer when clicking outside the panel.
           *
           * IMPORTANT: We use onMouseDown (not onClick) and call
           * e.stopPropagation() is NOT needed here — we simply check that
           * the click target is the backdrop element itself, not a child.
           * This prevents the backdrop from firing when the user clicks
           * on the UserMenu or AppSwitcher dropdowns that float above it
           * via position:fixed + z-index:9999.
           */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
            onClick={(e) => {
              // Only close if the click landed directly on the backdrop,
              // not on any floating child (fixed dropdowns bubble up to here).
              if (e.target === e.currentTarget) close();
            }}
          />

          {/* Drawer panel — no overflow-y-auto on the outer shell so that
              absolute-positioned dropdowns inside rightContent can escape it */}
          <div
            id="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed left-0 right-0 top-16 z-[49] bg-[var(--color-panel)] border-b border-[var(--color-border-strong)] shadow-2xl"
            style={{ animation: "navSlideDown 0.2s ease-out both" }}
          >
            <style>{`
              @keyframes navSlideDown {
                from { opacity: 0; transform: translateY(-6px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/*
             * Nav links live in their own SCROLLABLE area so a long item list
             * doesn't push the page. Capped at 60dvh to always leave room for
             * the rightContent row below.
             */}
            {headerItems.length > 0 && (
              <div className="max-h-[60dvh] overflow-y-auto">
                <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
                  <nav className="space-y-0.5" aria-label="Mobile navigation">
                    {headerItems.map(renderMobileItem)}
                  </nav>
                </div>
              </div>
            )}

            {/*
             * rightContent (AppSwitcher + UserMenu) lives OUTSIDE the
             * overflow-y-auto wrapper above. Any ancestor with overflow:auto
             * becomes a clipping context for absolute-positioned descendants,
             * which is why the dropdowns used to be cut off at the drawer's
             * bottom edge. Keeping this sibling overflow-visible lets the
             * dropdowns float freely on top of the page content below.
             */}
            {rightContent && (
              <div
                className={`mx-auto max-w-7xl px-4 sm:px-6 pt-3 pb-4 ${headerItems.length > 0 ? "border-t border-[var(--color-border)]" : "py-3"}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-wrap items-center gap-3 px-1">
                  {rightContent}
                </div>
              </div>
            )}

            {!rightContent && headerItems.length === 0 && <div className="pb-4" />}
          </div>
        </>
      )}
    </>
  );
}

/**
 * Hook to fetch navigation from the API
 */
export function useNavigation(
  app: AppCode,
  placement?: string,
  group?: string,
) {
  const [items, setItems] = useState<ResolvedNavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchNav = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ app });
        if (placement) params.set("placement", placement);
        if (group) params.set("group", group);

        const res = await fetch(`/api/navigation?${params}`);
        if (res.status === 401 || res.status === 403) {
          setItems([]);
          setError(null);
          return;
        }
        if (!res.ok)
          throw new Error(`Failed to fetch navigation: ${res.status}`);

        const data = await res.json();
        setItems(data.items || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    fetchNav();
  }, [app, placement, group]);

  return { items, loading, error, refetch: () => {} };
}
