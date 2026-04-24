"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Logo } from "./Logo";
import { AppSwitcher } from "./AppSwitcher";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationsBell } from "./NotificationsBell";
import { UserMenu } from "./UserMenu";
import { useOutsideClick } from "@/lib/use-outside-click";
import { useTranslation } from "@asafarim/shared-i18n";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";

const nav = [
  { href: "/#generator", label: "Generator", labelKey: "cg.nav.generator", icon: <GeneratorIcon /> },
  { href: "/#features", label: "Features", labelKey: "cg.nav.templates", icon: <FeaturesIcon /> },
  { href: "/#prompts", label: "Prompts", labelKey: "cg.nav.history", icon: <PromptsIcon /> },
];

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";

function GeneratorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M8 2L2 8h3v6h6V8h3L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function FeaturesIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M8 2l1.5 3h3l-2.5 2 1 3-3-2-3 2 1-3-2.5-2h3L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function PromptsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 2h8v2H4V2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2 5h12v8H2V5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return pathname === "/" || pathname === href;
    }
    return pathname === href;
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)] text-[var(--color-text)]">
      <CommandPalette />

      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-300 lg:relative lg:z-30 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-[60px]" : "w-[240px]"}`}
      >
        {/* Logo area */}
        <div className="flex h-14 items-center border-b border-[var(--color-border)] px-3">
          {collapsed ? (
            <Link href="/" className="mx-auto" aria-label="Content Generator home">
              <Logo size={32} showWordmark={false} />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2" aria-label="Content Generator home">
              <Logo size={32} showWordmark={false} />
              <span className="text-sm font-semibold">Content Generator</span>
            </Link>
          )}
        </div>

        {/* Collapse button (desktop) */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden absolute right-[-12px] top-16 h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
            {collapsed ? (
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {nav.map((item) => {
              const label = item.labelKey ? t(item.labelKey) : item.label;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? "bg-[var(--color-surface-elevated)] text-[var(--color-primary)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
                    }`}
                    title={collapsed ? label : undefined}
                  >
                    {item.icon}
                    {!collapsed && <span>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-[var(--color-border)] p-3">
          {collapsed ? (
            <a
              href={portalUrl}
              title="Back to Portal"
              className="flex h-9 w-full items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ) : (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3">
              <a
                href={portalUrl}
                className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 shrink-0" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to Portal
              </a>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 px-3 backdrop-blur lg:px-5">
          {/* Left: mobile hamburger + breadcrumb */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)] lg:hidden"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <span className="hidden text-[var(--color-text-secondary)] sm:inline">ASafariM</span>
              <span className="hidden text-[var(--color-text-secondary)] sm:inline">/</span>
              <span className="hidden text-[var(--color-text-secondary)] md:inline">Content Generator</span>
              <span className="hidden text-[var(--color-text-secondary)] md:inline">/</span>
              <span className="truncate font-medium text-[var(--color-text)]">
                {nav.find((n) => isActive(n.href))?.label ?? "Generator"}
              </span>
            </div>
          </div>

          {/* Center: command palette trigger */}
          <button
            type="button"
            onClick={() => {
              const evt = new KeyboardEvent("keydown", { key: "k", metaKey: true });
              window.dispatchEvent(evt);
            }}
            className="hidden h-8 min-w-[260px] max-w-[360px] flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 text-xs text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)] md:flex"
            aria-label="Search"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M14 14l-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <span className="flex-1 text-left">Jump to page or app…</span>
            <kbd className="rounded bg-[var(--color-surface)] px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>

          {/* Right controls */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-[var(--color-surface-elevated)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-primary)] xl:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
              {t("cg.header.aiEngine")}
            </span>
            <NotificationsBell />
            <CountryLanguageSelector />
            <ThemeToggle />
            <AppSwitcher current="content-generator" />
            <UserMenu />
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-5 lg:p-8">{children}</main>

        {/* Footer */}
        <footer className="shrink-0 border-t border-[var(--color-border)] px-5 py-3">
          <div className="flex flex-col gap-1 text-xs text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {new Date().getFullYear()} ASafariM Digital — Content Generator</span>
            <span className="flex items-center gap-3">
              <a href={portalUrl} className="hover:text-[var(--color-text)] transition-colors">Portal</a>
              <span>·</span>
              <a
                href="https://github.com/AliSafari-IT/asafarim-digital"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[var(--color-text)] transition-colors"
              >
                GitHub
              </a>
              <span>·</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-success)] animate-pulse" />
                Live
              </span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
