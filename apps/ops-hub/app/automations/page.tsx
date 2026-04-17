import { prisma } from "@asafarim/db";
import { StatusBadge } from "@/components/StatusBadge";
import { AutomationToggle } from "./AutomationToggle";
import { requireOps } from "@/lib/rbac";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const session = await requireOps("read");
  const automations = await prisma.automation.findMany({
    orderBy: [{ isEnabled: "desc" }, { name: "asc" }],
    include: {
      runs: { orderBy: { startedAt: "desc" }, take: 5 },
      _count: { select: { runs: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Automations</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Ops automations</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Scheduled jobs and event handlers that keep the business running.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {automations.map((a) => {
          const lastRun = a.runs[0];
          const successRate = a.runs.length
            ? Math.round((a.runs.filter((r) => r.status === "success").length / a.runs.length) * 100)
            : null;
          return (
            <article key={a.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">{a.name}</h3>
                    <StatusBadge value={a.isEnabled ? "enabled" : "disabled"} compact />
                  </div>
                  <p className="mt-0.5 text-[11px] font-mono text-[var(--color-text-subtle)]">{a.code}</p>
                </div>
                <AutomationToggle id={a.id} enabled={a.isEnabled} canWrite={session.canWrite} />
              </div>

              {a.description && <p className="mt-3 text-xs text-[var(--color-text-muted)]">{a.description}</p>}

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <Meta label="Trigger" value={a.trigger === "schedule" ? `cron · ${a.schedule}` : `event · ${a.eventType}`} />
                <Meta label="Action" value={a.action} />
                <Meta label="Last run" value={lastRun ? formatRelative(lastRun.startedAt) : "never"} />
                <Meta label="Success rate" value={successRate === null ? "—" : `${successRate}% (${a._count.runs} runs)`} />
              </div>

              <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">Recent runs</p>
                <ul className="mt-2 space-y-1.5 text-xs">
                  {a.runs.length === 0 && <li className="text-[var(--color-text-subtle)]">No runs yet.</li>}
                  {a.runs.map((r) => (
                    <li key={r.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            r.status === "success" ? "bg-emerald-400" :
                            r.status === "failed" ? "bg-rose-400" : "bg-slate-400"
                          }`}
                        />
                        <span className="text-[var(--color-text-muted)]">{r.status}</span>
                        <span className="truncate text-[var(--color-text-subtle)]">{r.output}</span>
                      </div>
                      <span className="text-[var(--color-text-subtle)]">{formatRelative(r.startedAt)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">{label}</p>
      <p className="mt-0.5 text-[var(--color-text)] font-mono text-[11px] truncate">{value}</p>
    </div>
  );
}
