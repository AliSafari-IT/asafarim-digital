import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatNumber, formatPercent, formatRelative } from "@/lib/format";
import { funnel, leads } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const STAGES: Array<"new" | "mql" | "sql" | "won" | "lost"> = ["new", "mql", "sql", "won", "lost"];

export default function LeadsPage() {
  const byStage = (s: string) => leads.filter((l) => l.stage === s);
  const qualified = byStage("mql").length + byStage("sql").length + byStage("won").length;
  const unqualified = byStage("new").length + byStage("lost").length;

  const sourceCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.source] = (acc[l.source] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Leads"
        title="Lead pipeline"
        description="Funnel stages, source mix, and recent lead activity."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="MQLs this month" value={formatNumber(funnel.mqls)} tone="accent" delta={{ value: "12.4% MoM", positive: true }} />
        <KpiCard label="SQLs this month" value={formatNumber(funnel.sqls)} tone="brand" hint={`${formatPercent(funnel.sqls / funnel.mqls, 0)} MQL→SQL`} />
        <KpiCard label="Qualified (recent)" value={formatNumber(qualified)} tone="success" hint={`of ${leads.length} recent`} />
        <KpiCard label="Unqualified (recent)" value={formatNumber(unqualified)} tone="warning" />
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {STAGES.map((s) => {
          const items = byStage(s);
          return (
            <div key={s} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between">
                <StatusBadge value={s} />
                <span className="font-mono text-xs text-[var(--color-text-subtle)]">{items.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((l) => (
                  <div key={l.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 p-2.5">
                    <p className="text-sm font-medium text-[var(--color-text)]">{l.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{l.company}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px]">
                      <span className="text-[var(--color-text-subtle)]">{l.source}</span>
                      <span className="font-mono text-[var(--color-accent)]">{l.score}</span>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="py-4 text-center text-[10px] text-[var(--color-text-subtle)]">No leads</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Source breakdown</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Recent leads grouped by acquisition channel.</p>
          <div className="mt-4 space-y-3">
            {Object.entries(sourceCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([src, count]) => {
                const pct = Math.round((count / leads.length) * 100);
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between text-xs">
                      <StatusBadge value={src} />
                      <span className="font-mono text-[var(--color-text)]">{count} · {pct}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="lg:col-span-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-5 py-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent submissions</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-2 font-semibold">Lead</th>
                <th className="px-4 py-2 font-semibold">Company</th>
                <th className="px-4 py-2 font-semibold">Source</th>
                <th className="px-4 py-2 font-semibold">Stage</th>
                <th className="px-4 py-2 font-semibold text-right">Score</th>
                <th className="px-4 py-2 font-semibold text-right">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{l.name}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{l.company}</td>
                  <td className="px-4 py-3"><StatusBadge value={l.source} /></td>
                  <td className="px-4 py-3"><StatusBadge value={l.stage} /></td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-accent)]">{l.score}</td>
                  <td className="px-4 py-3 text-right text-xs text-[var(--color-text-subtle)]">{formatRelative(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
