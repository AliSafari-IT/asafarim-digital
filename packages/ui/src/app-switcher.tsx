"use client";

import { useRef, useState } from "react";
import { useOutsideClick } from "./use-outside-click";

export type AppKey = "portal" | "content-generator" | "ops-hub" | "marketing-content" | "edumatch";

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
  {
    key: "edumatch",
    name: "EduMatch",
    tagline: "Education matching platform",
    tag: "Edu",
    urlEnv: "NEXT_PUBLIC_EDUMATCH_URL",
    fallback: process.env.NEXT_PUBLIC_EDUMATCH_URL || "https://edumatch.asafarim.com",
    mark: "E",
    gradient: "from-green-500 to-emerald-500",
    ring: "ring-green-500/30",
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

function getGradientStyle(key: string): string {
  const gradients: Record<string, string> = {
    portal: "linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%)",
    "content-generator": "linear-gradient(135deg, #8b5cf6 0%, #a21caf 100%)",
    "ops-hub": "linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)",
    "marketing-content": "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
    edumatch: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
  };
  return gradients[key] || gradients.portal;
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
        className={"inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"}
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
          style={{
            width: '320px',
            maxWidth: 'calc(100vw - 1rem)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-strong)',
            zIndex: 9999,
          }}
          className="absolute right-0 top-[calc(100%+0.75rem)] rounded-xl p-3 shadow-[var(--shadow-card)]"
        >
            <div className="mb-2 flex items-center justify-between px-2">
              <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}>
                ASafariM Apps
              </p>
              <span className={`rounded-full ${isCompact ? "bg-white/5" : "bg-[var(--color-panel)]"} px-2 py-0.5 text-[10px] font-mono ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}>
                {apps.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', width: '100%' }}>
              {apps.map((a) => {
                const isCurrent = a.key === current;
                const href = resolveUrl(a.urlEnv, a.fallback);
                return (
                  <a
                    key={a.key}
                    href={href}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      padding: '10px 8px',
                      paddingRight: '45px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      background: isCurrent ? 'var(--color-primary-soft)' : 'var(--color-panel)',
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                      position: 'relative',
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          flexShrink: 0,
                          background: getGradientStyle(a.key),
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }}
                        className="flex items-center justify-center rounded-lg text-sm font-bold text-white ring-1 ring-inset ring-white/10"
                      >
                        {a.mark}
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, paddingRight: '5px' }}>
                        {a.name}
                      </p>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0, paddingLeft: '40px' }}>
                      {a.tagline}
                    </p>
                    <span style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '8px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '2px 5px',
                      borderRadius: '3px',
                      background: isCurrent ? 'var(--color-primary)' : 'var(--color-surface)',
                      color: isCurrent ? 'white' : 'var(--color-text-muted)',
                    }}>
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
