"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { OpsHubLogo } from "./Logo";

const nav = [
  { href: "/overview",      label: "Overview",      icon: <OverviewIcon /> },
  { href: "/tenants",       label: "Tenants",        icon: <TenantsIcon /> },
  { href: "/users",         label: "Users",          icon: <UsersIcon /> },
  { href: "/billing",       label: "Billing",        icon: <BillingIcon /> },
  { href: "/feature-flags", label: "Feature Flags",  icon: <FlagsIcon /> },
  { href: "/lifecycle",     label: "Lifecycle",      icon: <LifecycleIcon /> },
  { href: "/automations",   label: "Automations",    icon: <AutomationsIcon /> },
  { href: "/audit",         label: "Audit Log",      icon: <AuditIcon /> },
];

export function Shell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string | null; email: string; roles: string[] };
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-soft)]/80 backdrop-blur">
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-[var(--color-border)] px-4">
            <Link href="/overview" className="flex items-center">
              <OpsHubLogo />
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">Console</p>
            <ul className="space-y-0.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive(item.href)
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
                    }`}
                  >
                    <span className={`w-4 shrink-0 ${isActive(item.href) ? "text-[var(--color-accent)]" : "text-[var(--color-text-subtle)]"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-[var(--color-border)] p-3 space-y-0.5">
            <a
              href={portalUrl}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)] transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Portal
            </a>
          </div>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1 flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-5 backdrop-blur">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[var(--color-text-subtle)] truncate">ASafariM Digital</span>
              <span className="text-[var(--color-text-subtle)]">/</span>
              <span className="font-medium text-[var(--color-text)] truncate">
                {nav.find((n) => isActive(n.href))?.label ?? "Ops Hub"}
              </span>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Role badges */}
              <div className="hidden items-center gap-1 md:flex">
                {user.roles
                  .filter((r) => r.startsWith("ops_") || r === "superadmin")
                  .map((r) => (
                    <span key={r} className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                      {r.replace(/_/g, " ")}
                    </span>
                  ))}
              </div>
              <UserMenu user={user} />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-5 lg:p-8">{children}</main>

          {/* Footer */}
          <footer className="shrink-0 border-t border-[var(--color-border)] px-5 py-3">
            <div className="flex flex-col gap-1 text-xs text-[var(--color-text-subtle)] sm:flex-row sm:items-center sm:justify-between">
              <span>&copy; {new Date().getFullYear()} ASafariM Digital — SaaS Operations Hub</span>
              <span className="flex items-center gap-3">
                <a href={portalUrl} className="hover:text-[var(--color-text)] transition-colors">Portal</a>
                <span>·</span>
                <a href="https://github.com/AliSafari-IT" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-text)] transition-colors">GitHub</a>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user }: { user: { name: string | null; email: string; roles: string[] } }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = (user.name ?? user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2.5 py-1.5 text-sm font-medium transition hover:border-[var(--color-accent)]"
      >
        {session?.user?.image ? (
          <img
            src={session.user.image}
            alt={user.name ?? "User"}
            width={24}
            height={24}
            referrerPolicy="no-referrer"
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[140px] truncate sm:block text-xs">{user.name ?? user.email}</span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[var(--color-text-muted)]" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-2 shadow-lg">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] px-4 py-3 mb-2">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user.name ?? "User"}</p>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                setOpen(false);
                await signOut({ callbackUrl: process.env.NEXT_PUBLIC_PORTAL_URL ?? "/" });
              }}
              className="w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-bg-soft)]"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function OverviewIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function TenantsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="5.5" y="9" width="5" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 13c0-2.76 2.24-4 5-4s5 1.24 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 7a2 2 0 1 0 0-4M15 13c0-1.86-1.34-3-4-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function BillingIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 6h14" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M4 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function FlagsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 2v12M3 2h8l-2 4 2 4H3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function LifecycleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 12C2 7.58 5.58 4 10 4h1M10 2l3 2-3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 4C14 8.42 10.42 12 6 12H5M6 14l-3-2 3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function AutomationsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M9 2L5 8h5l-3 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function AuditIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
