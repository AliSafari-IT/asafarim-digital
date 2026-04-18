"use client";

import { useRef, useState } from "react";
import { useOutsideClick } from "./use-outside-click";

export type AppKey = "portal" | "content-generator" | "ops-hub" | "marketing-content";

const apps: Array<{
  key: AppKey;
  name: string;
  tagline: string;
  tag: string;
  urlEnv: string;
  fallback: string;
  mark: string;
  gradient: string;
  ring: string;
}> = [
  {
    key: "portal",
    name: "Portal",
    tagline: "Home · Content · Admin",
    tag: "Hub",
    urlEnv: "NEXT_PUBLIC_PORTAL_URL",
    fallback: process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com",
    mark: "A",
    gradient: "from-blue-500 to-indigo-600",
    ring: "ring-blue-500/30",
  },
  {
    key: "content-generator",
    name: "Content Generator",
    tagline: "AI writing workspace",
    tag: "AI",
    urlEnv: "NEXT_PUBLIC_CONTENT_GENERATOR_URL",
    fallback: process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL || "https://content-generator-qa.asafarim.com",
    mark: "C",
    gradient: "from-violet-500 to-fuchsia-600",
    ring: "ring-fuchsia-500/30",
  },
  {
    key: "ops-hub",
    name: "Ops Hub",
    tagline: "SaaS operations + billing",
    tag: "SaaS",
    urlEnv: "NEXT_PUBLIC_OPS_HUB_URL",
    fallback: process.env.NEXT_PUBLIC_OPS_HUB_URL || "https://ops-hub.asafarim.com",
    mark: "O",
    gradient: "from-indigo-500 to-cyan-500",
    ring: "ring-cyan-500/30",
  },
  {
    key: "marketing-content",
    name: "Marketing Content",
    tagline: "Growth + content engine",
    tag: "Growth",
    urlEnv: "NEXT_PUBLIC_MARKETING_CONTENT_URL",
    fallback: process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL || "https://marketing-content.asafarim.com",
    mark: "M",
    gradient: "from-rose-500 to-amber-500",
    ring: "ring-rose-500/30",
  },
];

function resolveUrl(envKey: string, fallback: string): string {
  // Only NEXT_PUBLIC_* are available in the browser; fallback otherwise.
  if (typeof window !== "undefined") {
    // Next.js inlines NEXT_PUBLIC_* at build time.
    const v = (process.env as Record<string, string | undefined>)[envKey];
    if (v) return v;
  }
  return fallback;
}

export function AppSwitcher({ current, variant = "default" }: { current: AppKey; variant?: "default" | "compact" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));

  const isCompact = variant === "compact";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Switch app"
        title="Switch app"
        className={isCompact
          ? "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
          : "group inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
        }
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className={isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true">
          <rect x="1" y="1" width="4" height="4" rx="1" />
          <rect x="7" y="1" width="4" height="4" rx="1" />
          <rect x="1" y="7" width="4" height="4" rx="1" />
          <rect x="7" y="7" width="4" height="4" rx="1" />
          <rect x="13" y="1" width="2" height="2" rx="0.5" />
          <rect x="13" y="7" width="2" height="2" rx="0.5" />
          <rect x="1" y="13" width="2" height="2" rx="0.5" />
          <rect x="7" y="13" width="2" height="2" rx="0.5" />
          <rect x="13" y="13" width="2" height="2" rx="0.5" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          className={isCompact
            ? "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[320px] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3 shadow-2xl"
            : "absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[320px] rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-3 shadow-[var(--shadow-card)]"
          }
        >
            <div className="flex items-center justify-between px-2 pb-2">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}>
                ASafariM Apps
              </p>
              <span className={`rounded-full ${isCompact ? "bg-white/5" : "bg-[var(--color-panel)]"} px-2 py-0.5 text-[10px] font-mono ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}>
                {apps.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {apps.map((a) => {
                const isCurrent = a.key === current;
                const href = resolveUrl(a.urlEnv, a.fallback);
                return (
                  <a
                    key={a.key}
                    href={href}
                    className={`${isCompact ? "rounded-xl" : "rounded-2xl"} group relative overflow-hidden border p-3 transition-all ${
                      isCurrent
                        ? isCompact
                          ? "border-[var(--color-accent)] bg-[var(--color-primary-soft)]"
                          : "border-[var(--color-primary)] bg-[var(--color-primary-soft)]"
                        : isCompact
                          ? "border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 hover:border-[var(--color-border-strong)] hover:bg-white/[0.04]"
                          : "border-[var(--color-border)] bg-[var(--color-panel)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${a.gradient} text-sm font-bold text-white shadow-lg ring-1 ${a.ring}`}
                    >
                      {a.mark}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">{a.name}</p>
                    <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--color-text-muted)]">
                      {a.tagline}
                    </p>
                    <span className={`absolute right-2 top-2 rounded-full ${isCompact ? "bg-white/5" : "bg-[var(--color-panel)]"} px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${isCompact ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-muted)]"}`}>
                      {isCurrent ? "Current" : a.tag}
                    </span>
                  </a>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] px-2 pt-3">
              <span className={`text-[10px] ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}>
                Unified SSO · one account
              </span>
            </div>
        </div>
      )}
    </div>
  );
}
