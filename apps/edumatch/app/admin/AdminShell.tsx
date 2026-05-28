"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AdminNavItem = {
  label: string;
  href: string;
  icon: string;
  disabled?: boolean;
};

const adminNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: "OV" },
  { label: "Tutor Verifications", href: "/admin/tutor-verifications", icon: "TV" },
  { label: "Matching Debug", href: "/admin/tutor-matching", icon: "MD" },
  { label: "Disputes", href: "/admin/disputes", icon: "DS" },
  { label: "Bookings", href: "/admin/bookings", icon: "BK" },
  { label: "Payments", href: "/admin/payments", icon: "PY" },
  { label: "Inquiries", href: "/admin/inquiries", icon: "IQ" },
  { label: "Users & Tutors", href: "/admin/users", icon: "UT" },
  { label: "Audit Log", href: "/admin/audit", icon: "AU" },
];

function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminShell({
  children,
  userEmail,
  userRoles,
}: {
  children: ReactNode;
  userEmail: string;
  userRoles: string[];
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
            >
              &larr; EduMatch
            </Link>
            <span className="text-[var(--color-border)]">|</span>
            <h1 className="text-base font-semibold text-[var(--color-text)]">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-[var(--color-text-muted)] sm:inline">
              {userEmail}
            </span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              {userRoles.filter((r) => ["admin", "superadmin", "edumatch_admin"].includes(r)).join(", ") || "admin"}
            </span>
          </div>
        </div>
      </header>

      {/* Mobile nav — outside the sidebar flex so it stacks vertically */}
      <div className="md:hidden border-b border-[var(--color-border)] overflow-x-auto">
        <nav className="flex gap-1 p-2">
          {adminNav.filter((i) => !i.disabled).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                isActive(item.href, pathname)
                  ? "bg-emerald-500/15 font-medium text-emerald-400"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-bg)] md:block">
          <nav className="flex flex-col gap-0.5 p-3">
            {adminNav.map((item) => {
              if (item.disabled) {
                return (
                  <span
                    key={item.href}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-[var(--color-text-muted)]/50 cursor-not-allowed"
                    title="Coming soon"
                  >
                    <span className="text-xs font-semibold tracking-[0.08em] opacity-50">
                      {item.icon}
                    </span>
                    {item.label}
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive(item.href, pathname)
                      ? "bg-emerald-500/15 font-medium text-emerald-400"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <span className="text-xs font-semibold tracking-[0.08em]">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
