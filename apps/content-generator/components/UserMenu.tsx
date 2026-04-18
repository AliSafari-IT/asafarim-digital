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

function Avatar({ src, alt, name, email, size = 28 }: AvatarProps) {
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
    <div className="relative shrink-0">
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
          ref={ref}
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[280px] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg"
        >
          <div className="border-b border-[var(--color-border)] p-4">
            <p className="text-sm font-semibold text-[var(--color-text)]">{session?.user?.name ?? "User"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{session?.user?.email}</p>
          </div>
          <div className="p-2">
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
              className="w-full cursor-pointer rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--color-danger)] transition hover:bg-[var(--color-surface-elevated)]"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
