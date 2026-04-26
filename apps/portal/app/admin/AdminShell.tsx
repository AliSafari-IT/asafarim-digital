"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: "DB" },
  { label: "Users", href: "/admin/users", icon: "US" },
  { label: "Roles", href: "/admin/roles", icon: "RL" },
  { label: "Content", href: "/admin/content", icon: "CT" },
  { label: "Navigation", href: "/admin/navigation", icon: "NV" },
  { label: "Settings", href: "/admin/settings", icon: "ST" },
  { label: "Audit Log", href: "/admin/audit", icon: "AU" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]">
              Back to Portal
            </Link>
            <span className="text-white/20">|</span>
            <h1 className="text-base font-semibold text-[var(--color-text)]">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--color-text-muted)]">{session?.user?.email}</span>
            <span className="rounded-full bg-[var(--color-accent)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
              {session?.user?.roles?.join(", ") ?? "-"}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-white/10 bg-[var(--color-bg)]">
          <nav className="flex flex-col gap-0.5 p-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive(item.href)
                    ? "bg-[var(--color-accent)]/15 font-medium text-[var(--color-accent)]"
                    : "text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]"
                }`}
              >
                <span className="text-xs font-semibold tracking-[0.08em]">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
