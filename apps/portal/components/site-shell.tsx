"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { initializeTheme, persistTheme, applyTheme, subscribeThemeChanges, type Theme } from "@asafarim/ui";
import { useTranslation } from "@asafarim/shared-i18n";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import { AppSwitcher } from "@asafarim/ui";
import { AppNavbar, type NavItem as AsafNavItem, type RenderLink } from "@asafarim/navigation";

type NavItem = {
  href: string;
  /** Fallback label used when no translation key matches. */
  label: string;
  /** Optional i18n key, e.g. `portal.nav.capabilities`. */
  labelKey?: string;
};

const defaultNavItems: NavItem[] = [
  { href: "/#capabilities", label: "Capabilities", labelKey: "portal.nav.capabilities" },
  { href: "/#showcase", label: "Work", labelKey: "portal.nav.work" },
  { href: "/#process", label: "Process", labelKey: "portal.nav.process" },
  { href: "/#stack", label: "Stack", labelKey: "portal.nav.stack" },
  { href: "/#contact", label: "Contact", labelKey: "portal.nav.contact" },
];

function resolvePortalAvatarSrc(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/api/uploads/avatars/")) return src;
  if (src.startsWith("/uploads/avatars/")) {
    return src.replace("/uploads/avatars/", "/api/uploads/avatars/");
  }
  return src;
}

function canAccessAdmin(roles?: string[]) {
  return Boolean(roles?.includes("admin") || roles?.includes("superadmin"));
}

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
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
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
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
        >
          Sign up
        </Link>
      </div>
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
  const showAdminLink = canAccessAdmin(session.user.roles);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-3 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-primary)]"
      >
        {resolvePortalAvatarSrc(session.user.image) ? (
          <img
            src={resolvePortalAvatarSrc(session.user.image) ?? undefined}
            alt={session.user.name ?? "User"}
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[160px] truncate sm:block">{session.user.name ?? session.user.email}</span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[var(--color-text-muted)]" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 min-w-[250px] rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-2 shadow-[var(--shadow-card)]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] px-4 py-3">
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
                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border border-amber-400/30 bg-amber-400/10 text-amber-300"
                }`}
              >
                {session.user.emailVerified ? "Verified" : "Verification pending"}
              </span>
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            {showAdminLink && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-left text-sm font-medium transition hover:bg-[var(--color-panel)]"
              >
                Admin panel
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/profile");
              }}
              className="cursor-pointer rounded-2xl px-4 py-3 text-left text-sm font-medium transition hover:bg-[var(--color-panel)]"
            >
              Profile settings
            </button>
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
              className="cursor-pointer rounded-2xl px-4 py-3 text-left text-sm font-medium transition hover:bg-[var(--color-panel)]"
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
              className="cursor-pointer rounded-2xl px-4 py-3 text-left text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-panel)]"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Portal logo (also used as the AppNavbar `logo` slot). */
function PortalLogo() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Back to home">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0b1324,#111d3a)] shadow-[var(--shadow-glow)] ring-1 ring-white/10">
        <img src="/brand/logo-mark.svg" alt="" aria-hidden="true" width="28" height="28" className="h-7 w-7" />
      </span>
      <span className="hidden sm:block">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
          ASafariM Digital
        </span>
        <span className="block text-[15px] font-semibold tracking-[-0.01em]">Frontend · Backend · AI</span>
      </span>
    </Link>
  );
}

/** Next.js Link adapter for AppNavbar. */
const renderLink: RenderLink = ({ item, children }) => {
  if (!item.href) return <>{children}</>;
  if (item.external || /^https?:\/\//.test(item.href)) {
    return (
      <a href={item.href} className="asaf-nav-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={item.href} className="asaf-nav-link">
      {children}
    </Link>
  );
};

export function SiteHeader({
  navItems = defaultNavItems,
}: {
  navItems?: NavItem[];
}) {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const pathname = usePathname();

  // Inject the Admin link only for admins / superadmins.
  const resolvedNavItems = canAccessAdmin(session?.user?.roles)
    ? [...navItems, { href: "/admin", label: "Admin", labelKey: "portal.nav.admin" }]
    : navItems;

  // Translate labels + adapt to AppNavbar's NavItem shape.
  const asafNavItems = useMemo<AsafNavItem[]>(
    () =>
      resolvedNavItems.map((item) => ({
        id: item.href,
        label: item.labelKey ? t(item.labelKey) : item.label,
        href: item.href,
      })),
    [resolvedNavItems, t]
  );

  return (
    <AppNavbar
      sticky
      bordered
      fullWidth
      currentPath={pathname}
      renderLink={renderLink}
      logo={<PortalLogo />}
      navItems={asafNavItems}
      countryLangSelector={<CountryLanguageSelector />}
      themeToggler={<ThemeToggle />}
      actions={
        <div className="flex items-center gap-2">
          <AppSwitcher current="portal" />
          <UserMenu />
        </div>
      }
      className="bg-[color:color-mix(in_srgb,var(--color-surface)_82%,transparent)] backdrop-blur-xl"
    />
  );
}

export function SiteFooter({ subtitle }: { subtitle?: string }) {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {year} ASafariM Digital</p>
        <p>{subtitle ?? "Premium SaaS delivery across frontend, backend, and AI systems"}</p>
      </div>
    </footer>
  );
}
