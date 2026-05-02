"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ResolvedNavItem, AppCode } from "@asafarim/types";
import { getNavIcon, DEFAULT_NAV_ICON } from "./nav-icons";

interface CommonSidebarProps {
  items: ResolvedNavItem[];
  app: AppCode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  width?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

/**
 * CommonSidebar - A product-agnostic sidebar renderer
 * Consumes resolved navigation items from the shared navigation API
 */
export function CommonSidebar({
  items,
  app,
  header,
  footer,
  className = "",
  width = "w-64",
  collapsible = false,
  collapsed = false,
  onCollapse,
}: CommonSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Filter sidebar items with no parent
  const sidebarItems = items.filter(
    (item) => !item.parentId && item.placement === "sidebar"
  );

  // Group items by their group property
  const groupedItems = sidebarItems.reduce<Record<string, ResolvedNavItem[]>>((acc, item) => {
    const group = item.group || "main";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const renderNavItem = (item: ResolvedNavItem, depth = 0) => {
    const Icon = getNavIcon(item.icon);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.resolvedHref || item.href);

    const baseClasses = `
      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
      transition-colors duration-200
      ${active
        ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
        : "text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5"
      }
      ${depth > 0 ? "ml-4" : ""}
      ${collapsed ? "justify-center px-2" : ""}
    `;

    // With children - render as expandable section
    if (hasChildren && !collapsed) {
      return (
        <div key={item.id} className="space-y-1">
          <div className={baseClasses}>
            <Icon />
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
          {!collapsed && (
            <div className="ml-4 space-y-1">
              {item.children?.map((child: ResolvedNavItem) => renderNavItem(child, depth + 1))}
            </div>
          )}
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
          title={collapsed ? item.label : undefined}
        >
          <Icon />
          {!collapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </>
          )}
        </a>
      );
    }

    // Internal link
    return (
      <Link
        key={item.id}
        href={item.resolvedHref || item.href}
        className={baseClasses}
        title={collapsed ? item.label : undefined}
      >
        <Icon />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`
        flex flex-col h-full bg-[var(--color-bg)] border-r border-white/10
        ${collapsed ? "w-16" : width}
        transition-all duration-300
        ${className}
      `}
    >
      {/* Header */}
      {header && (
        <div className={`p-4 border-b border-white/10 ${collapsed ? "px-2" : ""}`}>
          {header}
        </div>
      )}

      {/* Collapse toggle */}
      {collapsible && (
        <button
          onClick={() => onCollapse?.(!collapsed)}
          className="absolute right-0 top-4 translate-x-1/2 w-6 h-6 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {Object.entries(groupedItems).map(([groupName, groupItems]) => (
          <div key={groupName} className="space-y-1">
            {!collapsed && groupName !== "main" && (
              <div className="px-3 py-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                {groupName}
              </div>
            )}
            {groupItems.map((item: ResolvedNavItem) => renderNavItem(item))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {footer && (
        <div className={`p-4 border-t border-white/10 ${collapsed ? "px-2" : ""}`}>
          {footer}
        </div>
      )}
    </aside>
  );
}

/**
 * Sidebar layout component that combines sidebar with main content
 */
interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SidebarLayout({ sidebar, children, className = "" }: SidebarLayoutProps) {
  return (
    <div className={`flex min-h-screen ${className}`}>
      {sidebar}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
