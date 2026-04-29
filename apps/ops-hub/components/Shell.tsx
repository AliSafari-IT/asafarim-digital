"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { OpsHubLogo, OpsHubMark } from "./Logo";
import { AppSwitcher } from "@asafarim/ui";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";
import { useOutsideClick } from "../lib/use-outside-click";

const nav = [
  { href: "/overview",      label: "Overview",      icon: <OverviewIcon />,    section: "Console" },
  { href: "/tenants",       label: "Tenants",       icon: <TenantsIcon />,     section: "Console" },
  { href: "/users",         label: "Users",         icon: <UsersIcon />,       section: "Console" },
  { href: "/billing",       label: "Billing",       icon: <BillingIcon />,     section: "Revenue" },
  { href: "/system",        label: "System",        icon: <SystemIcon />,      section: "Platform" },
  { href: "/feature-flags", label: "Feature Flags", icon: <FlagsIcon />,       section: "Platform" },
  { href: "/lifecycle",     label: "Lifecycle",     icon: <LifecycleIcon />,   section: "Platform" },
  { href: "/automations",   label: "Automations",   icon: <AutomationsIcon />, section: "Platform" },
  { href: "/audit",         label: "Audit Log",     icon: <AuditIcon />,       section: "Compliance" },
];

const SECTIONS = ["Console", "Revenue", "Platform", "Compliance"] as const;

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";
const contentGeneratorUrl = process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL || "https://content-generator-qa.asafarim.com";
const opsHubUrl = process.env.NEXT_PUBLIC_OPS_HUB_URL || "https://ops-hub.asafarim.com";
const marketingContentUrl = process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL || "https://marketing-content.asafarim.com";

function resolveSharedAvatarSrc(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;

  const normalized = src.startsWith("/uploads/avatars/")
    ? src.replace("/uploads/avatars/", "/api/uploads/avatars/")
    : src;

  if (normalized.startsWith("/api/uploads/avatars/")) {
    return `${portalUrl}${normalized}`;
  }

  return normalized;
}

export function Shell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string | null; email: string; roles: string[] };
}) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("ops:sidebar") : null;
    if (saved === "collapsed") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ops:sidebar", collapsed ? "collapsed" : "expanded");
    }
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <CommandPalette
        nav={nav.map(({ href, label }) => ({ href, label }))}
        appsHrefs={{
          portal: portalUrl,
          contentGenerator: contentGeneratorUrl,
          opsHub: opsHubUrl,
          marketingContent: marketingContentUrl,
        }}
      />

      <div className="flex flex-1 min-h-0">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 flex h-screen ${collapsed ? "w-[72px]" : "w-64"} shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-soft)]/90 backdrop-blur transition-all duration-200 lg:sticky lg:top-0 lg:translate-x-0`}
        >
          <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-3">
            <Link href="/overview" className="flex items-center overflow-hidden">
              {collapsed ? (
                <OpsHubMark className="h-8 w-8 drop-shadow-[0_0_12px_rgba(34,211,238,0.3)]" />
              ) : (
                <OpsHubLogo />
              )}
            </Link>
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? "Expand" : "Collapse"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-subtle)] hover:bg-white/[0.04] hover:text-[var(--color-text)] lg:flex"
            >
              <svg viewBox="0 0 16 16" fill="none" className={`h-3.5 w-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`} aria-hidden="true">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            {SECTIONS.map((section) => {
              const items = nav.filter((n) => n.section === section);
              if (items.length === 0) return null;
              return (
                <div key={section} className="mb-4">
                  {!collapsed && (
                    <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
                      {section}
                    </p>
                  )}
                  <ul className="space-y-0.5">
                    {items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`group relative flex items-center gap-3 rounded-lg ${collapsed ? "justify-center px-2" : "px-3"} py-2 text-sm transition-colors ${
                              active
                                ? "bg-[var(--color-primary-soft)] text-[var(--color-text)]"
                                : "text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
                            }`}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-x-2 -translate-y-1/2 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-400" />
                            )}
                            <span
                              className={`w-4 shrink-0 ${
                                active ? "text-[var(--color-accent)]" : "text-[var(--color-text-subtle)] group-hover:text-[var(--color-text-muted)]"
                              }`}
                            >
                              {item.icon}
                            </span>
                            {!collapsed && <span className="flex-1">{item.label}</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-border)] p-3">
            {collapsed ? (
              <a
                href={portalUrl}
                title="Back to Portal"
                className="flex h-9 w-full items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                  System status
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-xs text-[var(--color-text)]">All systems normal</span>
                </div>
                <a
                  href={portalUrl}
                  className="mt-3 flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
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

        <div className="min-w-0 flex-1 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-3 backdrop-blur lg:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)] lg:hidden"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <span className="hidden text-[var(--color-text-subtle)] sm:inline">ASafariM</span>
                <span className="hidden text-[var(--color-text-subtle)] sm:inline">/</span>
                <span className="hidden text-[var(--color-text-subtle)] md:inline">Ops Hub</span>
                <span className="hidden text-[var(--color-text-subtle)] md:inline">/</span>
                <span className="truncate font-medium text-[var(--color-text)]">
                  {nav.find((n) => isActive(n.href))?.label ?? "Overview"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const evt = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                window.dispatchEvent(evt);
              }}
              className="hidden h-8 min-w-[260px] max-w-[360px] flex-1 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 text-xs text-[var(--color-text-subtle)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-muted)] md:flex"
              aria-label="Search"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M14 14l-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="flex-1 text-left">Jump to page or app…</span>
              <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
            </button>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-1 xl:flex">
                {user.roles
                  .filter((r) => r.startsWith("ops_") || r === "superadmin")
                  .slice(0, 2)
                  .map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]"
                    >
                      {r.replace(/_/g, " ")}
                    </span>
                  ))}
              </div>
              <NotificationsBell />
              <ThemeToggle />
              <AppSwitcher current="ops-hub" variant="default"/>
              <UserMenu user={user} />
            </div>
          </header>

          <main className="flex-1 p-5 lg:p-8">{children}</main>

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

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, kind: "billing", text: "Fabrikam invoice past_due — day 3", when: "12m ago", read: false },
    { id: 2, kind: "churn",   text: "Churn risk flagged: Initech Holdings", when: "1h ago", read: false },
    { id: 3, kind: "auto",    text: "Legacy API deprecation job skipped", when: "3h ago", read: false },
  ]);
  const badge = notifications.filter((n) => !n.read).length;
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        title="Notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2h11L12 9V6a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M6 13a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div ref={ref} className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(21.25rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xl">
            <div className="flex flex-col gap-2 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-[var(--color-text)]">Notifications</p>
              {badge > 0 && (
                <button
                  onClick={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
                  className="text-[11px] font-medium text-[var(--color-accent)] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <ul className="max-h-[360px] divide-y divide-[var(--color-border)] overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="px-4 py-3 hover:bg-white/[0.02]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <p className="text-sm text-[var(--color-text)]">{n.text}</p>
                    <span className="text-[10px] text-[var(--color-text-subtle)] sm:shrink-0">{n.when}</span>
                  </div>
                  <span className="mt-1 inline-block rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    {n.kind}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-[var(--color-border)] px-4 py-2 text-center">
              <a href="/audit" className="text-[11px] font-medium text-[var(--color-accent)] hover:underline">
                View audit log →
              </a>
            </div>
          </div>
      )}
    </div>
  );
}

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}

function Avatar({ src, alt, name, email, size = 28, className = "" }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "?";

  // In development, use portal URL for avatars since files are stored there
  const avatarSrc = resolveSharedAvatarSrc(src);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={alt ?? name ?? "User"}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-[11px] font-bold text-white"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

function UserMenu({ user }: { user: { name: string | null; email: string; roles: string[] } }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));

  const initials = (user.name ?? user.email)
    .split(/[\s@]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const visibleRoles = user.roles.filter((r) => r.startsWith("ops_") || r === "superadmin");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-0.5 pr-2.5 text-sm font-medium transition hover:border-[var(--color-accent)]"
      >
        <Avatar
          src={session?.user?.image}
          alt={user.name ?? "User"}
          name={user.name}
          email={user.email}
          size={28}
        />
        <span className="hidden max-w-[120px] truncate text-xs sm:block">
          {user.name ?? user.email.split("@")[0]}
        </span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[var(--color-text-muted)]" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          ref={ref}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[300px] overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xl"
        >
            <div className="relative overflow-hidden border-b border-[var(--color-border)] p-4">
              <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-500/30 to-cyan-500/0 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <Avatar
                  src={session?.user?.image}
                  alt={user.name ?? "User"}
                  name={user.name}
                  email={user.email}
                  size={48}
                  className="ring-2 ring-cyan-500/30"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                    {user.name ?? "User"}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">{user.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {visibleRoles.length > 0 ? (
                      visibleRoles.slice(0, 3).map((r) => (
                        <span
                          key={r}
                          className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300 ring-1 ring-inset ring-cyan-500/20"
                        >
                          {r.replace(/_/g, " ")}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        viewer
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <MenuItem href={`${portalUrl}/profile`} icon={<UserCircleIcon />} label="Your profile" hint="Portal" />
              <MenuItem href={`${portalUrl}/admin`} icon={<ShieldIcon />} label="Admin area" hint="Portal" />
              <MenuItem href={portalUrl} icon={<PortalIcon />} label="Back to Portal" />
              <div className="my-1 h-px bg-[var(--color-border)]" />
              <button
                type="button"
                onClick={async () => {
                  setOpen(false);
                  await signOut({ callbackUrl: portalUrl });
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
              >
                <span className="flex h-5 w-5 items-center justify-center text-rose-400">
                  <SignOutIcon />
                </span>
                Sign out
              </button>
            </div>

            <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 px-4 py-2">
              <p className="text-[10px] text-[var(--color-text-subtle)]">
                Ops Hub · v0.1.0 · Unified SSO
              </p>
            </div>
          </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition hover:bg-white/[0.04] hover:text-[var(--color-text)]"
    >
      <span className="flex h-5 w-5 items-center justify-center text-[var(--color-text-subtle)] group-hover:text-[var(--color-accent)]">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[10px] font-mono text-[var(--color-text-subtle)]">{hint}</span>}
    </a>
  );
}

/* ────────── Icons ────────── */

function OverviewIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function TenantsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 13V6l6-4 6 4v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="5.5" y="9" width="5" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 13c0-2.76 2.24-4 5-4s5 1.24 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 7a2 2 0 1 0 0-4M15 13c0-1.86-1.34-3-4-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function BillingIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1 6h14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M4 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function FlagsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 2v12M3 2h8l-2 4 2 4H3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LifecycleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 12C2 7.58 5.58 4 10 4h1M10 2l3 2-3 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4C14 8.42 10.42 12 6 12H5M6 14l-3-2 3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AutomationsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M9 2L5 8h5l-3 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function AuditIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function SystemIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 13.5h6M8 10.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="4.5" cy="6.5" r="0.9" fill="currentColor" />
      <path d="M7 6.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function UserCircleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 13c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M8 1l5 2v5c0 3-2 5.5-5 7-3-1.5-5-4-5-7V3l5-2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 8l1.5 1.5L10.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PortalIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 7l6-5 6 5v7H2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 14V9h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function SignOutIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M7 3H3v10h4M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
