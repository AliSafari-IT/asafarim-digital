"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CommonNavbar,
  useNavigation,
  initializeTheme,
  persistTheme,
  applyTheme,
  subscribeThemeChanges,
  type Theme,
  AppSwitcher,
} from "@asafarim/ui";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import type { AppCode } from "@asafarim/types";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";
const viontoUrl = process.env.NEXT_PUBLIC_VIONTO_URL || "https://vionto.asafarim.com";

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(initializeTheme());
    const unsubscribe = subscribeThemeChanges((next: Theme) => {
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
                  await signOut({ callbackUrl: viontoUrl });
                } catch (error) {
                  console.error("Sign out error:", error);
                  window.location.href = viontoUrl;
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

function ViontoLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-[var(--color-text)]"
      aria-label="Vionto home"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-accent)]/15 text-sm font-semibold text-[var(--color-accent)]">
        Vi
      </span>
      <span className="text-base font-semibold tracking-tight">Vionto</span>
    </Link>
  );
}

export function ViontoTopbarControls() {
  return (
    <div className="flex items-center gap-2">
      <CountryLanguageSelector />
      <ThemeToggle />
      <AppSwitcher current="vionto" variant="default" />
      <UserMenu />
    </div>
  );
}

export function ViontoNav() {
  const { items, error } = useNavigation("vionto" as AppCode, "header");

  if (error) {
    console.error("Vionto navigation fetch error:", error);
  }

  return (
    <CommonNavbar
      items={items}
      app="vionto"
      logo={<ViontoLogo />}
      rightContent={<ViontoTopbarControls />}
      className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-xl"
      sticky
    />
  );
}
