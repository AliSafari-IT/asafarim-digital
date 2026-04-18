"use client";

import { useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useOutsideClick } from "@/lib/use-outside-click";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  email?: string | null;
  size?: number;
  className?: string;
}

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";

function resolveSharedAvatarSrc(src?: string | null) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;

  const normalized = src.startsWith("/uploads/avatars/")
    ? src.replace("/uploads/avatars/", "/api/uploads/avatars/")
    : src;

  if (normalized.startsWith("/api/uploads/avatars/")) {
    return `${portalUrl}${normalized}`;
  }

  return normalized;
}

function Avatar({ src, alt, name, email, size = 28, className = "" }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email?.[0]?.toUpperCase() ?? "?";

  // In development, use portal URL for avatars since files are stored there
  const avatarSrc = resolveSharedAvatarSrc(src);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={alt ?? name ?? "User"}
          width={size}
          height={size}
          referrerPolicy="no-referrer"
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-success)] text-[11px] font-bold text-white"
          style={{ width: size, height: size }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));

  if (!session?.user) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0.5 pr-2.5 text-sm font-medium transition hover:border-[var(--color-primary)]"
      >
        <Avatar
          src={session.user.image}
          alt={session.user.name ?? "User"}
          name={session.user.name}
          email={session.user.email}
          size={28}
        />
        <span className="hidden max-w-[120px] truncate text-xs sm:block">
          {session?.user?.name ?? session?.user?.email?.split("@")[0]}
        </span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-[var(--color-text-secondary)]" aria-hidden="true">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[300px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl"
        >
          <div className="relative overflow-hidden border-b border-[var(--color-border)] p-4">
            <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-success)]/0 blur-3xl" />
            <div className="relative flex items-center gap-3">
              <Avatar
                src={session.user.image}
                alt={session.user.name ?? "User"}
                name={session.user.name}
                email={session.user.email}
                size={48}
                className="ring-2 ring-[var(--color-primary)]/30"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {session.user.name ?? "User"}
                </p>
                <p className="truncate text-xs text-[var(--color-text-secondary)]">{session.user.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
                    Signed in
                  </span>
                  <span className="rounded-full bg-[var(--color-primary)]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-primary)] ring-1 ring-inset ring-[var(--color-primary)]/20">
                    SSO
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2">
            <MenuItem href={`${portalUrl}/profile`} icon={<UserCircleIcon />} label="Your profile" hint="Portal" />
            <MenuItem href={`${portalUrl}/profile`} icon={<SettingsIcon />} label="Account settings" hint="Portal" />
            <MenuItem href={portalUrl} icon={<PortalIcon />} label="Back to Portal" />
            <div className="my-1 h-px bg-[var(--color-border)]" />
            <button
              type="button"
              onClick={async () => {
                try {
                  setOpen(false);
                  await signOut({ callbackUrl: portalUrl });
                } catch (error) {
                  console.error("Sign out error:", error);
                  window.location.href = portalUrl;
                }
              }}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-danger)]/10"
            >
              <span className="flex h-5 w-5 items-center justify-center text-[var(--color-danger)]">
                <SignOutIcon />
              </span>
              Sign out
            </button>
          </div>
          <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)]/60 px-4 py-2">
            <p className="text-[10px] text-[var(--color-text-secondary)]">
              Content Generator · v0.1.0 · Unified SSO
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
    >
      <span className="flex h-5 w-5 items-center justify-center text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)]">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-[10px] font-mono text-[var(--color-text-secondary)]">{hint}</span>}
    </a>
  );
}

function UserCircleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 13c.8-2 2.4-3 4.5-3s3.7 1 4.5 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M13 3L11.5 4.5M4.5 11.5L3 13M13 13l-1.5-1.5M4.5 4.5L3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function PortalIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 7l6-5 6 5v7H2V7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M6 14V9h4v5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M7 3H3v10h4M10 5l3 3-3 3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
