"use client";

import { useEffect, useRef, useState } from "react";

export type AppKey =
  | "portal"
  | "content-generator"
  | "ops-hub"
  | "marketing-content"
  | "edumatch"
  | "vionto";

export interface AppVisibility {
  key: AppKey;
  requiredRoles?: string[]; // Roles that can see this app
  requiredPermissions?: string[]; // Permissions that can see this app
  public?: boolean; // If true, visible to all authenticated users
}

// Inline SVG logo components for each app
const AppLogos: Record<AppKey, React.ReactNode> = {
  portal: (
    <svg viewBox="0 0 64 64" className="h-5 w-5">
      <defs>
        <linearGradient id="portal-fe" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4c7dff" />
          <stop offset="100%" stopColor="#6aa3ff" />
        </linearGradient>
        <linearGradient id="portal-be" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5de4c7" />
          <stop offset="100%" stopColor="#36c6a8" />
        </linearGradient>
        <linearGradient id="portal-ai" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#111d3a" />
      <circle cx="32" cy="16" r="6" fill="url(#portal-ai)" />
      <circle cx="20" cy="44" r="6" fill="url(#portal-fe)" />
      <circle cx="44" cy="44" r="6" fill="url(#portal-be)" />
      <circle cx="32" cy="16" r="1.8" fill="#ffffff" />
      <circle cx="20" cy="44" r="1.8" fill="#ffffff" />
      <circle cx="44" cy="44" r="1.8" fill="#ffffff" />
    </svg>
  ),
  "content-generator": (
    <svg viewBox="0 0 64 64" className="h-5 w-5">
      <defs>
        <linearGradient id="cg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d0d0f" />
          <stop offset="100%" stopColor="#1a1f2c" />
        </linearGradient>
        <linearGradient id="cg-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3a7bff" />
          <stop offset="100%" stopColor="#4ff2c9" />
        </linearGradient>
        <linearGradient id="cg-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#f472b6" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="url(#cg-bg)" />
      <rect x="4" y="4" width="56" height="56" rx="12" fill="none" stroke="url(#cg-ring)" strokeWidth="1.5" opacity="0.6" />
      <circle cx="32" cy="32" r="14" fill="url(#cg-ring)" opacity="0.3" />
      <g stroke="url(#cg-ring)" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M16 32 Q32 16 48 32" />
        <path d="M16 32 Q32 48 48 32" />
      </g>
      <circle cx="16" cy="32" r="2.5" fill="url(#cg-spark)" />
      <circle cx="48" cy="32" r="2.5" fill="url(#cg-spark)" />
    </svg>
  ),
  "ops-hub": (
    <svg viewBox="0 0 64 64" className="h-5 w-5">
      <defs>
        <linearGradient id="ops-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#0f172a" />
      <rect x="12" y="20" width="40" height="24" rx="4" fill="url(#ops-grad)" opacity="0.9" />
      <circle cx="22" cy="32" r="3" fill="#0f172a" />
      <circle cx="32" cy="32" r="3" fill="#0f172a" />
      <circle cx="42" cy="32" r="3" fill="#0f172a" />
      <rect x="36" y="12" width="16" height="8" rx="2" fill="#06b6d4" />
    </svg>
  ),
  "marketing-content": (
    <svg viewBox="0 0 64 64" className="h-5 w-5">
      <defs>
        <linearGradient id="mkt-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#1a0a0f" />
      <path d="M12 48 L24 24 L36 36 L48 16 L52 20 L36 48 L24 36 L16 48 Z" fill="url(#mkt-grad)" />
      <circle cx="48" cy="16" r="4" fill="#fbbf24" />
    </svg>
  ),
  edumatch: (
    <svg viewBox="0 0 64 64" className="h-5 w-5">
      <defs>
        <linearGradient id="edu-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#0a1f0f" />
      <polygon points="32,12 48,20 32,28 16,20" fill="url(#edu-grad)" />
      <path d="M18 24 L18 40 Q32 48 46 40 L46 24" stroke="url(#edu-grad)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="44" cy="34" r="2.5" fill="#34d399" />
    </svg>
  ),
  vionto: (
    <svg viewBox="0 0 64 64" className="h-5 w-5">
      <rect x="4" y="4" width="56" height="56" rx="12" fill="#101112" />
      <path d="M18 20h8l6 20 6-20h8L38 48H26L18 20Z" fill="#f36f56" />
      <circle cx="46" cy="20" r="3" fill="#e8b45d" />
    </svg>
  ),
};

const apps: Array<{
  key: AppKey;
  name: string;
  tagline: string;
  tag: string;
  urlEnv: string;
  fallback: string;
  logo: React.ReactNode;
  gradient: string;
  ring: string;
  visibility: AppVisibility;
}> = [
  {
    key: "portal",
    name: "Portal",
    tagline: "Home · Content · Admin",
    tag: "Hub",
    urlEnv: "NEXT_PUBLIC_PORTAL_URL",
    fallback:
      process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com",
    logo: AppLogos.portal,
    gradient: "from-blue-500 to-indigo-600",
    ring: "ring-blue-500/30",
    visibility: { key: "portal", public: true },
  },
  {
    key: "content-generator",
    name: "Content Generator",
    tagline: "AI writing workspace",
    tag: "AI",
    urlEnv: "NEXT_PUBLIC_CONTENT_GENERATOR_URL",
    fallback:
      process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL ||
      "https://content-generator.asafarim.com",
    logo: AppLogos["content-generator"],
    gradient: "from-violet-500 to-fuchsia-600",
    ring: "ring-fuchsia-500/30",
    visibility: { key: "content-generator", public: true },
  },
  {
    key: "ops-hub",
    name: "Ops Hub",
    tagline: "SaaS operations + billing",
    tag: "SaaS",
    urlEnv: "NEXT_PUBLIC_OPS_HUB_URL",
    fallback:
      process.env.NEXT_PUBLIC_OPS_HUB_URL || "https://ops-hub.asafarim.com",
    logo: AppLogos["ops-hub"],
    gradient: "from-indigo-500 to-cyan-500",
    ring: "ring-cyan-500/30",
    visibility: { key: "ops-hub", requiredRoles: ["ops_admin", "ops_viewer", "superadmin"] },
  },
  {
    key: "marketing-content",
    name: "Marketing Content",
    tagline: "Growth + content engine",
    tag: "Growth",
    urlEnv: "NEXT_PUBLIC_MARKETING_CONTENT_URL",
    fallback:
      process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL ||
      "https://marketing-content.asafarim.com",
    logo: AppLogos["marketing-content"],
    gradient: "from-rose-500 to-amber-500",
    ring: "ring-rose-500/30",
    visibility: { key: "marketing-content", public: true },
  },
  {
    key: "edumatch",
    name: "EduMatch",
    tagline: "Tutoring + AI homework help",
    tag: "Edu",
    urlEnv: "NEXT_PUBLIC_EDUMATCH_URL",
    fallback:
      process.env.NEXT_PUBLIC_EDUMATCH_URL || "https://edumatch.asafarim.com",
    logo: AppLogos.edumatch,
    gradient: "from-green-500 to-emerald-500",
    ring: "ring-green-500/30",
    visibility: { key: "edumatch", public: true },
  },
  {
    key: "vionto",
    name: "Vionto",
    tagline: "Photo-to-story video creator",
    tag: "Video",
    urlEnv: "NEXT_PUBLIC_VIONTO_URL",
    fallback:
      process.env.NEXT_PUBLIC_VIONTO_URL || "https://vionto.asafarim.com",
    logo: AppLogos.vionto,
    gradient: "from-orange-500 to-pink-500",
    ring: "ring-orange-500/30",
    visibility: { key: "vionto", public: true },
  },
];

export { apps };

/**
 * Filter apps based on user roles and permissions
 * Use this server-side to determine which apps to show in the UI
 */
export function filterAppsByRoles(
  userRoles: string[],
  userPermissions?: string[],
): typeof apps {
  return apps.filter((app) => {
    const visibility = app.visibility;

    // Public apps are visible to all authenticated users
    if (visibility.public) {
      return true;
    }

    // Check required roles
    if (visibility.requiredRoles && visibility.requiredRoles.length > 0) {
      const hasRequiredRole = visibility.requiredRoles.some((role) =>
        userRoles.includes(role),
      );
      if (hasRequiredRole) return true;
    }

    // Check required permissions
    if (
      visibility.requiredPermissions &&
      visibility.requiredPermissions.length > 0
    ) {
      const hasRequiredPermission = visibility.requiredPermissions.some(
        (perm) => userPermissions?.includes(perm),
      );
      if (hasRequiredPermission) return true;
    }

    // If no specific requirements, hide by default
    return false;
  });
}

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
    vionto: "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
  };
  return gradients[key] || gradients.portal;
}

export function AppSwitcher({
  current,
  variant = "default",
}: {
  current: AppKey;
  variant?: "default" | "compact";
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside both the button and the dropdown panel.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!btnRef.current?.contains(t) && !dropRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isCompact = variant === "compact";

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Switch app"
        title="Switch app"
        className={
          "inline-flex h-8 min-h-8 w-8 min-w-8 shrink-0 aspect-square items-center justify-center rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
        }
      >
        <svg
          viewBox="0 0 16 16"
          fill="currentColor"
          className={isCompact ? "block h-3.5 w-3.5 shrink-0" : "block h-4 w-4 shrink-0"}
          aria-hidden="true"
        >
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
          ref={dropRef}
          role="dialog"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[9999] w-[min(21.25rem,calc(100vw-1rem))] max-h-[min(520px,calc(100vh-96px))] overflow-y-auto rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)]"
        >
          <div className="mb-2 flex items-center justify-between px-2">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}
            >
              ASafariM Apps
            </p>
            <span
              className={`rounded-full ${isCompact ? "bg-white/5" : "bg-[var(--color-panel)]"} px-2 py-0.5 text-[10px] font-mono ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}
            >
              {apps.length}
            </span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "8px",
              width: "100%",
            }}
          >
            {apps.map((a) => {
              const isCurrent = a.key === current;
              const href = resolveUrl(a.urlEnv, a.fallback);
              return (
                <a
                  key={a.key}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    paddingRight: "78px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                    background: isCurrent
                      ? "var(--color-primary-soft)"
                      : "var(--color-panel)",
                    transition: "all 0.2s",
                    textDecoration: "none",
                    position: "relative",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        flexShrink: 0,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                      className="flex items-center justify-center"
                    >
                      {a.logo}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--color-text)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: 0,
                        }}
                      >
                        {a.name}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--color-text-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          margin: "3px 0 0",
                        }}
                      >
                        {a.tagline}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "8px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 5px",
                      borderRadius: "3px",
                      background: isCurrent
                        ? "var(--color-primary)"
                        : "var(--color-surface)",
                      color: isCurrent ? "white" : "var(--color-text-muted)",
                    }}
                  >
                    {isCurrent ? "Current" : a.tag}
                  </span>
                </a>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] px-2 pt-3">
            <span
              className={`text-[10px] ${isCompact ? "text-[var(--color-text-subtle)]" : "text-[var(--color-text-muted)]"}`}
            >
              Unified SSO · one account
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
