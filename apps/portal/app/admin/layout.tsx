"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Roles", href: "/admin/roles", icon: "🔐" },
  { label: "Content", href: "/admin/content", icon: "📝" },
  { label: "Navigation", href: "/admin/navigation", icon: "🧭" },
  { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  { label: "Audit Log", href: "/admin/audit", icon: "📋" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
              ← Portal
            </Link>
            <span className="text-white/20">|</span>
            <h1 className="text-base font-semibold text-[var(--color-text)]">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--color-text-muted)]">{session?.user?.email}</span>
            <span className="rounded-full bg-[var(--color-accent)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
              {session?.user?.roles?.join(", ") ?? "—"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-white/10 bg-[var(--color-bg)]">
          <nav className="flex flex-col gap-0.5 p-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium"
                    : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
