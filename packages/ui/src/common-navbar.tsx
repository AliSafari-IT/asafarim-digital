"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ResolvedNavItem, AppCode } from "@asafarim/types";
import { getNavIcon, DEFAULT_NAV_ICON } from "./nav-icons";

interface CommonNavbarProps {
  items: ResolvedNavItem[];
  app: AppCode;
  logo?: React.ReactNode;
  rightContent?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

/**
 * CommonNavbar - A product-agnostic top navbar renderer
 * Consumes resolved navigation items from the shared navigation API
 */
export function CommonNavbar({
  items,
  app,
  logo,
  rightContent,
  className = "",
  sticky = true,
}: CommonNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Filter only header items with no parent
  const headerItems = items.filter(
    (item) => !item.parentId && (!item.placement || item.placement === "header")
  );

  const renderNavItem = (item: ResolvedNavItem, depth = 0) => {
    const Icon = getNavIcon(item.icon);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.resolvedHref || item.href);

    const baseClasses = `
      flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
      transition-colors duration-200
      ${active
        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5"
      }
      ${depth > 0 ? "pl-" + (3 + depth * 2) : ""}
    `;

    if (hasChildren) {
      return (
        <div key={item.id} className="relative group">
          <button className={baseClasses}>
            <Icon />
            <span>{item.label}</span>
            <svg
              className="w-4 h-4 ml-1 transition-transform group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className="absolute top-full left-0 mt-1 w-48 py-2 bg-[var(--color-bg)] border border-white/10 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {item.children?.map((child: ResolvedNavItem) => renderNavItem(child, depth + 1))}
          </div>
        </div>
      );
    }

    // External link
    if (item.target === "_blank" || item.href.startsWith("http")) {
      return (
        <a
          key={item.id}
          href={item.resolvedHref || item.href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
        >
          <Icon />
          <span>{item.label}</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      );
    }

    // Internal link
    return (
      <Link
        key={item.id}
        href={item.resolvedHref || item.href}
        className={baseClasses}
      >
        <Icon />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <header
      className={`
        w-full border-b border-white/10 bg-[var(--color-bg)]/95 backdrop-blur
        ${sticky ? "sticky top-0 z-50" : ""}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo || (
              <Link href="/" className="text-xl font-bold text-[var(--color-text)]">
                {app.charAt(0).toUpperCase() + app.slice(1).replace(/-/g, " ")}
              </Link>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {headerItems.map((item) => renderNavItem(item))}
          </nav>

          {/* Right Content (user menu, etc) */}
          <div className="hidden md:flex items-center gap-4">
            {rightContent}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-1">
              {headerItems.map((item) => renderNavItem(item))}
            </nav>
            {rightContent && (
              <div className="mt-4 pt-4 border-t border-white/10">
                {rightContent}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

/**
 * Hook to fetch navigation from the API
 */
export function useNavigation(app: AppCode, placement?: string, group?: string) {
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
        if (!res.ok) throw new Error(`Failed to fetch navigation: ${res.status}`);

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
