import { prisma } from "@asafarim/db";
import Link from "next/link";
import { getSystemHealth, type AppHealthStatus } from "@/lib/system-health";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

const statusStyle: Record<AppHealthStatus, { dot: string; label: string }> = {
  ok: { dot: "bg-emerald-400", label: "text-emerald-400" },
  degraded: { dot: "bg-amber-400", label: "text-amber-400" },
  down: { dot: "bg-rose-400", label: "text-rose-400" },
};

function formatMs(ms: number | null) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

export default async function SystemPage() {
  const apps = await getSystemHealth();

  // Fetch last 10 health checks per app in one query
  const appIds = apps.map((a) => a.id);
  const recentChecks = appIds.length
    ? await prisma.healthCheck.findMany({
        where: { appId: { in: appIds } },
        orderBy: { checkedAt: "desc" },
        take: appIds.length * 10,
      })
    : [];

  const checksByApp = new Map<string, typeof recentChecks>();
  for (const c of recentChecks) {
    const list = checksByApp.get(c.appId) ?? [];
    if (list.length < 10) {
      list.push(c);
      checksByApp.set(c.appId, list);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
          System
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">
          App registry & health
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Live status and recent check history for every app in the platform.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/40 text-[11px] uppercase tracking-wider text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-5 py-3 text-left font-medium">App</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Response</th>
              <th className="px-5 py-3 text-left font-medium">HTTP</th>
              <th className="px-5 py-3 text-left font-medium">Env</th>
              <th className="px-5 py-3 text-left font-medium">Last deploy</th>
              <th className="px-5 py-3 text-left font-medium">Recent (10)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {apps.map((app) => {
              const style = statusStyle[app.status];
              const history = checksByApp.get(app.id) ?? [];
              return (
                <tr key={app.code} className="hover:bg-[var(--color-bg-soft)]/30">
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
                      >
                        {app.name}
                      </a>
                      <span className="mt-0.5 font-mono text-[10px] text-[var(--color-text-subtle)]">
                        {app.code}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      <span className={`text-xs uppercase tracking-wide ${style.label}`}>
                        {app.status}
                      </span>
                    </div>
                    {app.error && (
                      <p
                        className="mt-1 max-w-xs truncate text-[10px] text-rose-400/80"
                        title={app.error}
                      >
                        {app.error}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[var(--color-text-muted)]">
                    {formatMs(app.responseTimeMs)}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-[var(--color-text-muted)]">
                    {app.httpStatus ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-xs uppercase text-[var(--color-text-muted)]">
                    {app.environment}
                  </td>
                  <td className="px-5 py-4 text-xs text-[var(--color-text-muted)]">
                    {app.lastDeployedAt
                      ? formatRelative(new Date(app.lastDeployedAt))
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {history.length === 0 && (
                        <span className="text-[10px] text-[var(--color-text-subtle)]">
                          no history
                        </span>
                      )}
                      {history
                        .slice()
                        .reverse()
                        .map((h) => {
                          const s = statusStyle[h.status as AppHealthStatus] ?? statusStyle.down;
                          return (
                            <span
                              key={h.id}
                              className={`h-5 w-1.5 rounded-sm ${s.dot}`}
                              title={`${h.status} · ${h.responseTimeMs ?? "?"}ms · ${new Date(
                                h.checkedAt
                              ).toLocaleString()}`}
                            />
                          );
                        })}
                    </div>
                  </td>
                </tr>
              );
            })}
            {apps.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-sm text-[var(--color-text-subtle)]"
                >
                  No apps registered yet. Run the database seed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Link
          href="/overview"
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
        >
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}
