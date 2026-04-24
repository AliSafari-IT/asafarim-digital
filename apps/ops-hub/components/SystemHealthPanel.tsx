import Link from "next/link";
import type { AppHealth } from "@/lib/system-health";
import { formatRelative } from "@/lib/format";

const statusStyle: Record<AppHealth["status"], { dot: string; label: string; ring: string }> = {
  ok: {
    dot: "bg-emerald-400",
    label: "text-emerald-400",
    ring: "ring-emerald-400/30",
  },
  degraded: {
    dot: "bg-amber-400",
    label: "text-amber-400",
    ring: "ring-amber-400/30",
  },
  down: {
    dot: "bg-rose-400",
    label: "text-rose-400",
    ring: "ring-rose-400/30",
  },
};

function formatMs(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export function SystemHealthPanel({ apps }: { apps: AppHealth[] }) {
  const healthy = apps.filter((a) => a.status === "ok").length;
  const degraded = apps.filter((a) => a.status === "degraded").length;
  const down = apps.filter((a) => a.status === "down").length;

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
            System
          </p>
          <h3 className="mt-1 text-sm font-semibold text-[var(--color-text)]">
            App registry & health
          </h3>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
            Live status across all apps in the platform.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> {healthy} healthy
          </span>
          {degraded > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {degraded} degraded
            </span>
          )}
          {down > 0 && (
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> {down} down
            </span>
          )}
          <Link
            href="/system"
            className="text-[var(--color-accent)] hover:underline"
          >
            Details →
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {apps.map((app) => {
          const style = statusStyle[app.status];
          return (
            <a
              key={app.code}
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]/40 p-4 transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-soft)]/70`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                  {app.name}
                </span>
                <span
                  className={`relative flex h-2 w-2 items-center justify-center`}
                  aria-label={app.status}
                  title={app.status}
                >
                  {app.status === "ok" && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
                  )}
                  <span className={`relative h-2 w-2 rounded-full ${style.dot}`} />
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                <span className={`uppercase tracking-wide ${style.label}`}>
                  {app.status}
                </span>
                <span>{formatMs(app.responseTimeMs)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-[var(--color-text-subtle)]">
                <span className="font-mono">{app.code}</span>
                <span>{app.environment}</span>
              </div>
              {app.lastDeployedAt && (
                <div className="mt-2 text-[10px] text-[var(--color-text-subtle)]">
                  deployed {formatRelative(new Date(app.lastDeployedAt))}
                </div>
              )}
            </a>
          );
        })}
        {apps.length === 0 && (
          <p className="col-span-full py-6 text-center text-sm text-[var(--color-text-subtle)]">
            No apps registered yet. Run the seed to populate the registry.
          </p>
        )}
      </div>
    </section>
  );
}
