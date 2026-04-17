"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/overview", label: "Overview", icon: "▣" },
  { href: "/tenants", label: "Tenants", icon: "◎" },
  { href: "/users", label: "Users", icon: "◍" },
  { href: "/billing", label: "Billing", icon: "₪" },
  { href: "/feature-flags", label: "Feature Flags", icon: "⚑" },
  { href: "/lifecycle", label: "Lifecycle", icon: "↗" },
  { href: "/automations", label: "Automations", icon: "⟳" },
  { href: "/audit", label: "Audit Log", icon: "◉" },
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
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-soft)]/70 backdrop-blur">
          <div className="flex h-14 items-center gap-2.5 border-b border-[var(--color-border)] px-5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 text-[11px] font-bold text-slate-950">
              OH
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[var(--color-text)]">Ops Hub</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-subtle)]">SaaS Operations</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
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
                    <span className={`w-4 text-center text-base ${isActive(item.href) ? "text-[var(--color-accent)]" : "text-[var(--color-text-subtle)]"}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-[var(--color-border)] p-3">
            <a
              href={portalUrl}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
            >
              ← Back to Portal
            </a>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 px-6 backdrop-blur">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--color-text-subtle)]">Workspace</span>
              <span className="text-[var(--color-text-muted)]">/</span>
              <span className="font-medium text-[var(--color-text)]">ASafariM Digital</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="hidden text-[var(--color-text-muted)] md:inline">{user.email}</span>
              <div className="flex items-center gap-1">
                {user.roles
                  .filter((r) => r.startsWith("ops_") || r === "superadmin")
                  .map((r) => (
                    <span key={r} className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                      {r.replace("_", " ")}
                    </span>
                  ))}
              </div>
            </div>
          </header>

          <main className="p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
