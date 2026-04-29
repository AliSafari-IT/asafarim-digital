"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { AppSwitcher } from "@asafarim/ui";
import { useTranslation } from "@asafarim/shared-i18n";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import {
  initializeTheme,
  persistTheme,
  applyTheme,
  subscribeThemeChanges,
  type Theme,
} from "@asafarim/ui";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "http://localhost:3000";

type NavItem = {
  href: string;
  label: string;
};

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(initializeTheme());
    const unsubscribe = subscribeThemeChanges((next) => {
      setTheme(next);
      applyTheme(next);
    });
    return unsubscribe;
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    persistTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 3v2.5M12 18.5V21M4.64 4.64l1.77 1.77M17.59 17.59l1.77 1.77M3 12h2.5M18.5 12H21M4.64 19.36l1.77-1.77M17.59 6.41l1.77-1.77M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function UserMenu() {
  const { data: session, status, update } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-border)]" />;
  }

  if (!session?.user) {
    return (
      <Link
        href="/api/auth/signin"
        className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Sign in
      </Link>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-primary)]"
      >
        {session.user.image ? (
          <img
            src={session.user.image.startsWith("http") ? session.user.image : `${portalUrl}${session.user.image}`}
            alt={session.user.name ?? "User"}
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[120px] truncate sm:block">
          {session.user.name ?? session.user.email}
        </span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[var(--color-text-muted)]" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[260px] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-2 shadow-lg">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-sm font-semibold">{session.user.name ?? "User"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{session.user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {session.user.username && (
                <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] text-[var(--color-text-muted)]">
                  @{session.user.username}
                </span>
              )}
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] ${
                  session.user.emailVerified
                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                    : "border border-amber-400/30 bg-amber-400/10 text-amber-400"
                }`}
              >
                {session.user.emailVerified ? "Verified" : "Verification pending"}
              </span>
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            <a
              href={`${portalUrl}/profile`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--color-surface)]"
            >
              Profile settings
            </a>
            <button
              type="button"
              onClick={async () => {
                try {
                  await update();
                  setOpen(false);
                } catch (error) {
                  console.error("Session refresh error:", error);
                }
              }}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-left text-sm font-medium transition hover:bg-[var(--color-surface)]"
            >
              Refresh session
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await signOut({ callbackUrl: "/" });
                } catch (error) {
                  console.error("Sign out error:", error);
                  window.location.href = "/";
                }
              }}
              className="cursor-pointer rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-500 transition hover:bg-[var(--color-surface)]"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EduNav() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const user = session?.user;
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { href: "/", label: t("edumatch.nav.home") },
    ...(user?.roles?.includes("STUDENT") ? [
      { href: "/student", label: t("edumatch.dashboard.inquiries") },
      { href: "/student/inquiry/new", label: t("edumatch.dashboard.askQuestion") },
    ] : []),
    ...(user?.roles?.includes("TUTOR") ? [{ href: "/tutor", label: t("edumatch.nav.tutor") }] : []),
  ];

  // Close mobile menu when viewport grows
  useEffect(() => {
    if (!mobileOpen) return;
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-sm font-bold text-white shadow-lg shadow-green-500/20">
            E
          </div>
          <span className="text-lg font-bold text-[var(--color-text)]">EduMatch</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <CountryLanguageSelector />
          <ThemeToggle />
          <AppSwitcher current="edumatch" variant="default"/>
          <UserMenu />
          
          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text)] transition hover:border-[var(--color-primary)] md:hidden"
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 top-[61px] z-20 bg-[var(--color-surface)]/70 backdrop-blur-sm md:hidden"
          />
          <nav className="relative z-30 border-t border-[var(--color-border)] bg-[var(--color-panel)] md:hidden">
            <div className="mx-auto grid w-full max-w-7xl gap-1 px-4 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-4 py-3 text-base font-medium text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
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
