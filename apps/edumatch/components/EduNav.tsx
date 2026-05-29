"use client";

import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const { t } = useTranslation();
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
        {t("common.signIn")}
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
                  ? t("edumatch.nav.verified")
                  : t("edumatch.nav.verificationPending")}
              </span>
            </div>
          </div>

          <div className="mt-2 grid gap-1">
            <a
              href={`${portalUrl}/profile`}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--color-surface)]"
            >
              {t("edumatch.nav.profileSettings")}
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
              {t("edumatch.nav.refreshSession")}
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
              {t("common.signOut")}
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
 * Right content that lives on the desktop navbar rail and in the mobile
 * drawer — app switcher + user account menu.
 */
function DrawerContent() {
  return (
    <>
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
function toNavItems(items: ResolvedNavItem[], pathname?: string): NavItem[] {
  return items.map((r) => {
    const href = r.resolvedHref || r.href;
    const Icon = r.icon ? getNavIcon(r.icon) : null;
    return {
      id: r.id,
      label: r.label,
      href,
      active: pathname ? pathname === href : undefined,
      icon: Icon ? <Icon /> : undefined,
      external: r.target === "_blank" || /^https?:\/\//.test(href),
      children: r.children ? toNavItems(r.children, pathname) : undefined,
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
  const [mounted, setMounted] = useState(false);
  const [viewType, setViewType] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useTranslation();
  const { items, error } = useNavigation("edumatch" as AppCode, "header");

  useEffect(() => {
    const updateViewType = () => {
      const width = window.innerWidth;
      setViewType(width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop");
    };

    updateViewType();
    setMounted(true);
    window.addEventListener("resize", updateViewType);
    return () => window.removeEventListener("resize", updateViewType);
  }, []);

  if (error) {
    console.error("Navigation fetch error:", error);
  }

  const navItems = useMemo(() => {
    const resolvedItems = toNavItems(items, pathname);
    const isStudent = session?.user?.roles?.includes("edumatch_student");
    const isTutor = session?.user?.roles?.includes("edumatch_tutor");
    const isAdminUser = session?.user?.roles?.some((r: string) =>
      ["admin", "superadmin", "edumatch_admin"].includes(r),
    );
    const isMobileDrawer = viewType !== "desktop";

    const adminItem: NavItem | null = isAdminUser
      ? {
          id: "admin-panel",
          label: "Admin",
          href: "/admin",
          active: pathname === "/admin",
          icon: (() => {
            const ShieldIcon = getNavIcon("security");
            return (
              <span style={{ display: "inline-flex", alignItems: "center", width: "1.25rem", height: "1.25rem", flexShrink: 0, marginRight: "0.25rem" }}>
                <ShieldIcon />
              </span>
            );
          })(),
        }
      : null;

    if (!mounted || (!isStudent && !isTutor)) {
      if (adminItem) return [...resolvedItems, adminItem];
      return resolvedItems;
    }

    // Desktop: append a My Profile link without drawer-specific chrome
    if (!isMobileDrawer) {
      const profileHref = isStudent ? "/student/profile" : "/tutor/profile";
      const ProfileIcon = getNavIcon("user");
      const profileItem: NavItem = {
        id: "my-profile",
        label: t("edumatch.drawer.myProfile"),
        href: profileHref,
        active: pathname === profileHref,
        icon: (
          <span style={{ display: "inline-flex", alignItems: "center", width: "1.25rem", height: "1.25rem", flexShrink: 0, marginRight: "0.25rem" }}>
            <ProfileIcon />
          </span>
        ),
      };
      if (adminItem) return [...resolvedItems, profileItem, adminItem];
      return [...resolvedItems, profileItem];
    }

    if (isStudent) {
      const HelpIcon = getNavIcon("help");
      const InboxIcon = getNavIcon("list");
      const UserIcon = getNavIcon("users");
      const duplicateHrefs = new Set(["/student/inquiry/new", "/student", "/student/profile"]);
      const navIcon = (Icon: React.FC) => (
        <span style={{ display: "inline-flex", alignItems: "center", width: "1.25rem", height: "1.25rem", flexShrink: 0, marginRight: "0.25rem" }}>
          <Icon />
        </span>
      );

      return [
        {
          id: "student-ask-question",
          label: t("edumatch.drawer.askQuestion"),
          href: "/student/inquiry/new",
          active: pathname === "/student/inquiry/new",
          icon: navIcon(HelpIcon),
        },
        {
          id: "student-my-inquiries",
          label: t("edumatch.drawer.myInquiries"),
          href: "/student?section=inquiries",
          active: pathname === "/student",
          icon: navIcon(InboxIcon),
        },
        {
          id: "student-my-profile",
          label: t("edumatch.drawer.myProfile"),
          href: "/student/profile",
          active: pathname === "/student/profile",
          icon: navIcon(UserIcon),
        },
        ...resolvedItems.filter((item) => !item.href || !duplicateHrefs.has(item.href)),
        ...(adminItem ? [adminItem] : []),
      ] satisfies NavItem[];
    }

    const DashboardIcon = getNavIcon("overview");
    const RequestsIcon = getNavIcon("chat");
    const BookingsIcon = getNavIcon("layers");
    const UserIcon = getNavIcon("user");
    const duplicateHrefs = new Set(["/tutor", "/tutor/requests", "/tutor/bookings", "/tutor/profile"]);
    const navIcon = (Icon: React.FC) => (
      <span style={{ display: "inline-flex", alignItems: "center", width: "1.25rem", height: "1.25rem", flexShrink: 0, marginRight: "0.5rem", verticalAlign: "middle" }}>
        <Icon />
      </span>
    );

    return [
      {
        id: "tutor-dashboard",
        label: t("edumatch.drawer.tutorDashboard"),
        href: "/tutor",
        active: pathname === "/tutor",
        icon: navIcon(DashboardIcon),
      },
      {
        id: "tutor-quote-requests",
        label: t("edumatch.drawer.quoteRequests"),
        href: "/tutor/requests",
        active: pathname === "/tutor/requests",
        icon: navIcon(RequestsIcon),
      },
      {
        id: "tutor-bookings",
        label: t("edumatch.drawer.bookings"),
        href: "/tutor/bookings",
        active: pathname === "/tutor/bookings",
        icon: navIcon(BookingsIcon),
      },
      {
        id: "tutor-my-profile",
        label: t("edumatch.drawer.myProfile"),
        href: "/tutor/profile",
        active: pathname === "/tutor/profile",
        icon: navIcon(UserIcon),
      },
      ...resolvedItems.filter((item) => !item.href || !duplicateHrefs.has(item.href)),
      ...(adminItem ? [adminItem] : []),
    ] satisfies NavItem[];
  }, [items, mounted, session?.user?.roles, t, viewType, pathname]);

  if (!mounted) return null;

  return (
    <AppNavbar
      sticky
      bordered
      fullWidth
      viewType={viewType}
      renderLink={renderLink}
      logo={<EduLogo />}
      navItems={navItems}
      countryLangSelector={<CompactControls />}
      themeToggler={<ThemeToggle />}
      actions={viewType === "desktop" ? <DrawerContent /> : undefined}
      className="bg-[var(--color-surface)]/80 backdrop-blur-xl"
    />
  );
}
