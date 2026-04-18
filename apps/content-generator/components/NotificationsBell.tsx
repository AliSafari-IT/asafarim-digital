"use client";

import { useRef, useState } from "react";
import { useOutsideClick } from "@/lib/use-outside-click";

const DEFAULT_NOTIFICATIONS = [
  { id: 1, kind: "content", text: "AI generation completed", when: "2m ago", read: false },
  { id: 2, kind: "system", text: "API rate limit reset", when: "1h ago", read: false },
  { id: 3, kind: "update", text: "New prompt templates available", when: "4h ago", read: false },
];

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));
  const badge = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        title="Notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M8 2a4 4 0 0 0-4 4v3l-1.5 2h11L12 9V6a4 4 0 0 0-4-4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M6 13a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        {badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[9px] font-bold text-white">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[320px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--color-text)]">Notifications</p>
            {badge > 0 && (
              <button
                type="button"
                onClick={() => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })))}
                className="text-[11px] font-medium text-[var(--color-primary)] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-[300px] divide-y divide-[var(--color-border)] overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-8 text-center text-xs text-[var(--color-text-secondary)]">
                You&apos;re all caught up.
              </li>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className={`px-4 py-3 hover:bg-[var(--color-surface-elevated)] ${n.read ? "opacity-60" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-[var(--color-text)]">
                      {!n.read && (
                        <span className="mr-2 inline-block h-1.5 w-1.5 -translate-y-[1px] rounded-full bg-[var(--color-danger)] align-middle" />
                      )}
                      {n.text}
                    </p>
                    <span className="shrink-0 text-[10px] text-[var(--color-text-secondary)]">{n.when}</span>
                  </div>
                  <span className="mt-1 inline-block rounded-full bg-[var(--color-surface-elevated)] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    {n.kind}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
