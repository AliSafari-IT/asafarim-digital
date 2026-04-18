import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatNumber } from "@/lib/format";
import { keywordGroups, seoTasks } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function SeoPage() {
  const totalTraffic = keywordGroups.reduce((s, k) => s + k.monthlyTraffic, 0);
  const improving = keywordGroups.filter((k) => k.avgPosition < k.prevPosition).length;
  const regressing = keywordGroups.filter((k) => k.avgPosition > k.prevPosition).length;
  const openTasks = seoTasks.filter((t) => t.status !== "done").length;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="SEO"
        title="Organic visibility"
        description="Keyword clusters, ranking deltas, traffic trends, and technical SEO tasks."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Tracked clusters" value={formatNumber(keywordGroups.length)} tone="brand" />
        <KpiCard label="Monthly organic traffic" value={formatNumber(totalTraffic)} tone="success" delta={{ value: "9.4% MoM", positive: true }} />
        <KpiCard label="Improving" value={formatNumber(improving)} tone="success" hint={`${regressing} regressing`} />
        <KpiCard label="Open SEO tasks" value={formatNumber(openTasks)} tone="warning" hint={`${seoTasks.length - openTasks} resolved`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="border-b border-[var(--color-border)] px-5 py-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Keyword clusters</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Avg position and monthly traffic per cluster.</p>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <th className="px-4 py-2 font-semibold">Cluster</th>
                <th className="px-4 py-2 font-semibold">Top keyword</th>
                <th className="px-4 py-2 font-semibold text-right">Position</th>
                <th className="px-4 py-2 font-semibold text-right">Traffic / mo</th>
                <th className="px-4 py-2 font-semibold text-right">Trend</th>
                <th className="px-4 py-2 font-semibold">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {keywordGroups.map((k) => {
                const delta = k.prevPosition - k.avgPosition; // + = improving
                return (
                  <tr key={k.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{k.cluster}</td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{k.topKeyword}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-[var(--color-text)]">{k.avgPosition.toFixed(1)}</span>
                      <span className={`ml-2 text-[10px] font-medium ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-[var(--color-text-subtle)]"}`}>
                        {delta > 0 ? `▲${delta.toFixed(1)}` : delta < 0 ? `▼${Math.abs(delta).toFixed(1)}` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(k.monthlyTraffic)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs ${k.trendPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {k.trendPct >= 0 ? "+" : ""}{k.trendPct.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={k.difficulty} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Page-level tasks</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Technical + on-page priorities.</p>
          <ul className="mt-4 space-y-3">
            {seoTasks.map((t) => (
              <li key={t.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-mono text-xs text-[var(--color-accent)]">{t.page}</p>
                  <StatusBadge value={t.priority} />
                </div>
                <p className="mt-1.5 text-sm text-[var(--color-text)]">{t.issue}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                  {t.status.replace("_", " ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
