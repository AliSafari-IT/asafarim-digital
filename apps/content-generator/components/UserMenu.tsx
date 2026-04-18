"use client";

import { useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useOutsideClick } from "@/lib/use-outside-click";

export function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));

  if (!session?.user) {
    return null;
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
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-0.5 pr-2.5 text-sm font-medium transition hover:border-[var(--color-primary)]"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            width={28}
            height={28}
            referrerPolicy="no-referrer"
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-success)] text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[120px] truncate text-xs sm:block">
          {session.user.name ?? session.user.email?.split("@")[0]}
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
            <p className="text-sm font-semibold text-[var(--color-text)]">{session.user.name ?? "User"}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{session.user.email}</p>
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
