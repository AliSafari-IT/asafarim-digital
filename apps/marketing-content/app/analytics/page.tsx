import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatCompact, formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { analyticsWeekly, channelBreakdown, funnel } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  const totalRevenue = analyticsWeekly.reduce((s, w) => s + w.revenueCents, 0);
  const totalVisitors = analyticsWeekly.reduce((s, w) => s + w.visitors, 0);
  const totalSignups = analyticsWeekly.reduce((s, w) => s + w.signups, 0);
  const totalSqls = analyticsWeekly.reduce((s, w) => s + w.sqls, 0);
  const maxRevenue = Math.max(...analyticsWeekly.map((w) => w.revenueCents));
  const maxVisitors = Math.max(...analyticsWeekly.map((w) => w.visitors));
  const totalChannelRevenue = channelBreakdown.reduce((s, c) => s + c.revenueCents, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Analytics"
        title="Cross-system performance"
        description="Weekly trends across traffic, conversion, and revenue. Channel attribution below."
        actions={
          <span className="text-xs text-[var(--color-text-subtle)]">Last 6 weeks</span>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Revenue (6w)" value={formatMoney(totalRevenue)} tone="brand" delta={{ value: "14.2%", positive: true }} />
        <KpiCard label="Visitors (6w)" value={formatNumber(totalVisitors)} tone="success" />
        <KpiCard label="Signups (6w)" value={formatNumber(totalSignups)} tone="accent" />
        <KpiCard label="SQLs (6w)" value={formatNumber(totalSqls)} tone="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Weekly revenue</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Revenue attributed to marketing sourced pipeline.</p>
          <div className="mt-6 flex h-48 items-end gap-3">
            {analyticsWeekly.map((w) => {
              const h = Math.max(8, Math.round((w.revenueCents / maxRevenue) * 100));
              return (
                <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex-1 overflow-hidden rounded-md bg-white/[0.03]">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-500 to-amber-400"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-text-subtle)]">{w.week}</span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{formatMoney(w.revenueCents)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Weekly visitors</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">All sources combined. SQL count overlaid.</p>
          <div className="mt-6 flex h-48 items-end gap-3">
            {analyticsWeekly.map((w) => {
              const h = Math.max(8, Math.round((w.visitors / maxVisitors) * 100));
              const sqlH = Math.max(2, Math.round((w.sqls / maxVisitors) * 100 * 20));
              return (
                <div key={w.week} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex-1 overflow-hidden rounded-md bg-white/[0.03]">
                    <div className="absolute bottom-0 left-0 right-0 bg-sky-500/40" style={{ height: `${h}%` }} />
                    <div className="absolute bottom-0 left-1/4 right-1/4 bg-fuchsia-500" style={{ height: `${Math.min(100, sqlH)}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-[var(--color-text-subtle)]">{w.week}</span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">{formatCompact(w.visitors)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-5 py-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Channel attribution</h3>
          <p className="text-xs text-[var(--color-text-muted)]">Traffic, signups, MQLs, and revenue by channel.</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-4 py-2 font-semibold">Channel</th>
              <th className="px-4 py-2 font-semibold text-right">Visitors</th>
              <th className="px-4 py-2 font-semibold text-right">Signups</th>
              <th className="px-4 py-2 font-semibold text-right">MQLs</th>
              <th className="px-4 py-2 font-semibold text-right">Revenue</th>
              <th className="px-4 py-2 font-semibold">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {channelBreakdown.map((c) => {
              const sharePct = Math.round((c.revenueCents / totalChannelRevenue) * 100);
              return (
                <tr key={c.channel} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><StatusBadge value={c.channel} /></td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(c.visitors)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(c.signups)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(c.mqls)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text)]">{formatMoney(c.revenueCents)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${sharePct}%` }} />
                      </div>
                      <span className="w-10 text-right font-mono text-[10px] text-[var(--color-text-subtle)]">{sharePct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Conversion efficiency</h3>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">Month-to-date stage conversions.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Visitor → Signup" value={formatPercent(funnel.signups / funnel.visitors, 2)} />
          <Stat label="Signup → MQL" value={formatPercent(funnel.mqls / funnel.signups, 1)} />
          <Stat label="MQL → SQL" value={formatPercent(funnel.sqls / funnel.mqls, 1)} />
          <Stat label="SQL → Won" value={formatPercent(funnel.won / funnel.sqls, 1)} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}
