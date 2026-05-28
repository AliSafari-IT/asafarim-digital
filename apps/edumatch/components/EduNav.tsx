"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useNavigation,
  initializeTheme,
  persistTheme,
  applyTheme,
  subscribeThemeChanges,
  type Theme,
  AppSwitcher,
  getNavIcon,
} from "@asafarim/ui";
import { useTranslation } from "@asafarim/shared-i18n";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import { AppNavbar, type NavItem, type RenderLink } from "@asafarim/navigation";
import type { AppCode, ResolvedNavItem } from "@asafarim/types";

const portalUrl =
  process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";
const edumatchUrl =
  process.env.NEXT_PUBLIC_EDUMATCH_URL || "https://edumatch.asafarim.com";

// Theme toggle component
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
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="group inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
    >
      {theme === "dark" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            d="M12 3v2.5M12 18.5V21M4.64 4.64l1.77 1.77M17.59 17.59l1.77 1.77M3 12h2.5M18.5 12H21M4.64 19.36l1.77-1.77M17.59 6.41l1.77-1.77M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-4 w-4"
          aria-hidden="true"
        >
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

// User menu component
function UserMenu() {
  const { data: session, status, update } = useSession();
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Calculate where the dropdown should appear, clamped within the viewport.
  const calcPos = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const dropW = 288; // w-72 = 18rem = 288px
    const margin = 8;
    // Prefer aligning right edge of dropdown to right edge of button
    let left = r.right - dropW;
    // Clamp so it never goes off the left or right edge
    left = Math.max(margin, Math.min(left, window.innerWidth - dropW - margin));
    setDropPos({ top: r.bottom + margin, left });
  };

  // Outside-click: close only when clicking outside BOTH the button and the dropdown panel.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node;
      const inBtn = btnRef.current?.contains(t);
      const inDrop = dropRef.current?.contains(t);
      if (!inBtn && !inDrop) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown, true);
    return () => document.removeEventListener("mousedown", onMouseDown, true);
  }, [open]);

  if (status === "loading") {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--color-border)]" />
    );
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
    : (session.user.email?.[0]?.toUpperCase() ?? "?");

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => {
          calcPos();
          setOpen((v) => !v);
        }}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-sm font-medium transition hover:border-[var(--color-primary)]"
      >
        {session.user.image ? (
          <img
            src={
              session.user.image.startsWith("http")
                ? session.user.image
                : `${portalUrl}${session.user.image}`
            }
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
        <svg
          viewBox="0 0 16 16"
          fill="none"
          className="h-3 w-3 text-[var(--color-text-muted)]"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            zIndex: 9999,
            width: 288,
          }}
          className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-2 shadow-2xl"
        >
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-sm font-semibold">
              {session.user.name ?? "User"}
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {session.user.email}
            </p>
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
                {session.user.emailVerified
                  ? "Verified"
                  : "Verification pending"}
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
                  await signOut({ callbackUrl: edumatchUrl });
                } catch (error) {
                  console.error("Sign out error:", error);
                  window.location.href = edumatchUrl;
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

// Logo component
function EduLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#14532d] to-[#052e16] shadow-lg shadow-green-500/20 ring-1 ring-green-500/30">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
        >
          <defs>
            <linearGradient id="capG" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <polygon points="16,6 26,11 16,16 6,11" fill="url(#capG)" />
          <path
            d="M9 13 L9 20 Q16 24 23 20 L23 13"
            stroke="#4ade80"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="26"
            y1="11"
            x2="26"
            y2="19"
            stroke="#34d399"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="26" cy="20.5" r="1.8" fill="#34d399" />
          <circle cx="16" cy="11" r="2" fill="#ffffff" opacity="0.9" />
        </svg>
      </div>
      <span className="text-lg font-bold">
        <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Edu
        </span>
        <span className="text-[var(--color-text)]">Match</span>
      </span>
    </Link>
  );
}

/**
 * Controls that are always pinned in the navbar bar at every breakpoint.
 * Language selector stays visible; theme is supplied through AppNavbar's
 * dedicated themeToggler slot.
 */
function CompactControls() {
  return (
    <>
      {/* Show flag+lang on sm+, flag-only on xs */}
      <CountryLanguageSelector compact={false} className="hidden sm:block" />
      <CountryLanguageSelector compact={true} className="sm:hidden" />
    </>
  );
}

/**
 * Student-specific quick actions for the mobile drawer.
 * These are the primary actions students need quick access to.
 *
 * Notes:
 * - Uses `mounted` guard to avoid hydration mismatch (useSession returns
 *   nothing during SSR but data on the client).
 * - `lg:hidden` keeps this block out of the desktop navbar rail; it only
 *   renders inside the mobile (<lg) hamburger drawer.
 */
function StudentDrawerActions() {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch: render nothing until client mount
  if (!mounted) return null;

  // Only show for students
  const isStudent = session?.user?.roles?.includes("edumatch_student");
  if (!isStudent) return null;

  const actions = [
    {
      id: "ask-question",
      label: t("edumatch.drawer.askQuestion"),
      href: "/student/inquiry/new",
      icon: "helpCircle",
      variant: "primary" as const,
    },
    {
      id: "my-inquiries",
      label: t("edumatch.drawer.myInquiries"),
      href: "/student",
      icon: "inbox",
      variant: "default" as const,
    },
    {
      id: "my-profile",
      label: t("edumatch.drawer.myProfile"),
      href: "/student/profile",
      icon: "user",
      variant: "default" as const,
    },
  ];

  return (
    <div className="lg:hidden border-b border-[var(--color-border)] pb-4 mb-4">
      <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {t("edumatch.drawer.studentActions")}
      </p>
      <div className="space-y-1 px-2">
        {actions.map((action) => {
          const Icon = getNavIcon(action.icon);
          const isActive = pathname === action.href || pathname.startsWith(`${action.href}/`);
          const isPrimary = action.variant === "primary";

          return (
            <Link
              key={action.id}
              href={action.href}
              className={[
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isPrimary
                  ? "bg-[var(--color-primary)] text-white hover:opacity-90"
                  : isActive
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
              ].join(" ")}
            >
              <span className={isPrimary ? "text-white" : ""}><Icon /></span>
              <span className="truncate">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Right content that lives on the desktop navbar rail and in the mobile
 * drawer — student actions + app switcher + user account menu.
 *
 * IMPORTANT: This entire tree uses client-only hooks (useSession,
 * usePathname, etc.). We gate it behind a `mounted` check so the server
 * and the client render identical markup during hydration. Without this,
 * AppNavbar receives different children on server vs client and throws a
 * hydration mismatch.
 */
function DrawerContent() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <StudentDrawerActions />
      <AppSwitcher current="edumatch" variant="default" />
      <UserMenu />
    </>
  );
}

/**
 * Convert API-resolved nav items into the shape AppNavbar expects.
 * - `icon` becomes a ReactNode (rendered via the shared icon map)
 * - `resolvedHref` (if present) wins over the raw href
 * - children are recursively mapped
 */
function toNavItems(items: ResolvedNavItem[]): NavItem[] {
  return items.map((r) => {
    const href = r.resolvedHref || r.href;
    const Icon = r.icon ? getNavIcon(r.icon) : null;
    return {
      id: r.id,
      label: r.label,
      href,
      icon: Icon ? <Icon /> : undefined,
      external: r.target === "_blank" || /^https?:\/\//.test(href),
      children: r.children ? toNavItems(r.children) : undefined,
    } satisfies NavItem;
  });
}

/** Next.js-aware link renderer. */
const renderLink: RenderLink = ({ item, children }) => {
  if (!item.href) return <>{children}</>;
  if (item.external) {
    return (
      <a
        href={item.href}
        className="asaf-nav-link"
        target="_blank"
        rel="noopener noreferrer"
      >
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

// EduMatch-specific wrapper around AppNavbar
export function EduNav() {
  const pathname = usePathname();
  const { items, error } = useNavigation("edumatch" as AppCode, "header");

  if (error) {
    console.error("Navigation fetch error:", error);
  }

  const navItems = useMemo(() => toNavItems(items), [items]);

  return (
    <AppNavbar
      sticky
      bordered
      fullWidth
      currentPath={pathname}
      renderLink={renderLink}
      logo={<EduLogo />}
      navItems={navItems}
      countryLangSelector={<CompactControls />}
      themeToggler={<ThemeToggle />}
      actions={<DrawerContent />}
      className="bg-[var(--color-surface)]/80 backdrop-blur-xl"
    />
  );
}
