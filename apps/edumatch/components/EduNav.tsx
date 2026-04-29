"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { AppSwitcher } from "@asafarim/ui";
import { useTranslation } from "@asafarim/shared-i18n";
import { LanguageSelector } from "./LanguageSelector";

export function EduNav() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const user = session?.user;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white">
            E
          </div>
          <span className="text-lg font-bold text-[var(--color-text)]">EduMatch</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/" label={t("edumatch.nav.home")} />
          {user?.roles?.includes("STUDENT") && (
            <>
              <NavLink href="/student" label={t("edumatch.dashboard.inquiries")} />
              <NavLink href="/student/inquiry/new" label={t("edumatch.dashboard.askQuestion")} />
            </>
          )}
          {user?.roles?.includes("TUTOR") && (
            <NavLink href="/tutor" label={t("edumatch.nav.tutor")} />
          )}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <AppSwitcher current="edumatch" />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden max-w-[150px] truncate text-sm text-[var(--color-text-muted)] sm:block">
                {user.name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                {t("edumatch.nav.signOut")}
              </button>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {t("edumatch.nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-panel)] hover:text-[var(--color-text)]"
    >
      {label}
    </Link>
  );
}
