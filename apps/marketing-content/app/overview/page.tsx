import Link from "next/link";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SectionHeader } from "@/components/SectionHeader";
import { formatCompact, formatMoney, formatNumber, formatPercent, formatRelative } from "@/lib/format";
import {
  analyticsWeekly,
  automations,
  campaigns,
  contentAssets,
  funnel,
  recentActivity,
} from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default function OverviewPage() {
  const liveCampaigns = campaigns.filter((c) => c.status === "live");
  const totalConversions = liveCampaigns.reduce((s, c) => s + c.conversions, 0);
  const totalSpent = liveCampaigns.reduce((s, c) => s + c.spentCents, 0);
  const publishedThisMonth = contentAssets.filter((a) => a.status === "published").length;
  const automationRuns24h = automations.reduce((s, a) => s + a.runs24h, 0);
  const latestWeek = analyticsWeekly[analyticsWeekly.length - 1];
  const prevWeek = analyticsWeekly[analyticsWeekly.length - 2];
  const organicDeltaPct = ((latestWeek.visitors - prevWeek.visitors) / prevWeek.visitors) * 100;
  const lpConv = funnel.signups / funnel.visitors;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Overview"
        title="Growth at a glance"
        description="Cross-channel marketing system: campaigns, content, SEO, leads, and automations."
        actions={
          <span className="text-xs text-[var(--color-text-subtle)] sm:text-right">
            Updated {new Date().toLocaleTimeString()}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Active campaigns"
          value={formatNumber(liveCampaigns.length)}
          tone="brand"
          hint={`${formatNumber(campaigns.length)} total across all statuses`}
        />
        <KpiCard
          label="MQLs this month"
          value={formatNumber(funnel.mqls)}
          delta={{ value: "12.4% MoM", positive: true }}
          tone="accent"
        />
        <KpiCard
          label="Organic traffic / wk"
          value={formatCompact(latestWeek.visitors)}
          delta={{ value: `${organicDeltaPct.toFixed(1)}% WoW`, positive: organicDeltaPct > 0 }}
          tone="success"
        />
        <KpiCard
          label="Landing page conv."
          value={formatPercent(lpConv)}
          delta={{ value: "0.3pp WoW", positive: true }}
          tone="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Content published" value={formatNumber(publishedThisMonth)} hint={`${contentAssets.length} in pipeline`} />
        <KpiCard label="Automation runs 24h" value={formatNumber(automationRuns24h)} hint={`${automations.filter((a) => a.status === "healthy").length}/${automations.length} healthy`} tone="success" />
        <KpiCard label="Conversions (live)" value={formatNumber(totalConversions)} hint="Across paid, SEO, email, social" />
        <KpiCard label="Spend (live)" value={formatMoney(totalSpent)} hint={`of ${formatMoney(liveCampaigns.reduce((s, c) => s + c.budgetCents, 0))} budgeted`} tone="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Campaign performance</h3>
            <Link href="/campaigns" className="text-xs text-[var(--color-accent)] hover:underline">
              View all →
            </Link>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Live campaigns, sorted by conversions.</p>
          <div className="mt-4 hidden overflow-hidden rounded-lg border border-[var(--color-border)] md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="w-[38%] px-4 py-2 font-semibold">Campaign</th>
                  <th className="w-[17%] px-4 py-2 font-semibold">Channel</th>
                  <th className="w-[15%] px-4 py-2 font-semibold text-right">Clicks</th>
                  <th className="w-[15%] px-4 py-2 font-semibold text-right">Conv.</th>
                  <th className="w-[15%] px-4 py-2 font-semibold text-right">Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {liveCampaigns
                  .sort((a, b) => b.conversions - a.conversions)
                  .slice(0, 5)
                  .map((c) => (
                    <tr key={c.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <p className="line-clamp-2 font-medium text-[var(--color-text)]">{c.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{c.owner}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge value={c.channel} /></td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{formatNumber(c.clicks)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text)]">{formatNumber(c.conversions)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs">{formatMoney(c.spentCents)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-3 md:hidden">
            {liveCampaigns
              .sort((a, b) => b.conversions - a.conversions)
              .slice(0, 5)
              .map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)]/35 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-[var(--color-text)]">{c.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{c.owner}</p>
                    </div>
                    <StatusBadge value={c.channel} />
                  </div>
                  <dl className="mt-4 grid grid-cols-3 gap-3">
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">Clicks</dt>
                      <dd className="mt-1 text-sm font-mono text-[var(--color-text)]">{formatNumber(c.clicks)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">Conv.</dt>
                      <dd className="mt-1 text-sm font-mono text-[var(--color-text)]">{formatNumber(c.conversions)}</dd>
                    </div>
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">Spend</dt>
                      <dd className="mt-1 text-sm font-mono text-[var(--color-text)]">{formatMoney(c.spentCents)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Funnel this month</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Top-of-funnel → closed won.</p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Visitors",  value: funnel.visitors, max: funnel.visitors },
              { label: "Signups",   value: funnel.signups,  max: funnel.visitors },
              { label: "MQLs",      value: funnel.mqls,     max: funnel.visitors },
              { label: "SQLs",      value: funnel.sqls,     max: funnel.visitors },
              { label: "Won",       value: funnel.won,      max: funnel.visitors },
            ].map((row) => {
              const pct = Math.max(1, Math.round((row.value / row.max) * 100));
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-muted)]">{row.label}</span>
                    <span className="font-mono text-[var(--color-text)]">{formatNumber(row.value)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Visitor → SQL</span>
              <span className="font-medium text-[var(--color-text)]">{formatPercent(funnel.sqls / funnel.visitors, 2)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>SQL → Won</span>
              <span className="font-medium text-[var(--color-text)]">{formatPercent(funnel.won / funnel.sqls, 1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent activity</h3>
          <Link href="/analytics" className="text-xs text-[var(--color-accent)] hover:underline">Full analytics →</Link>
        </div>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {recentActivity.map((e) => (
            <li key={e.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ActivityDot kind={e.kind} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--color-text)]">{e.title}</p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">{e.detail}</p>
                </div>
              </div>
              <span className="pl-5 text-xs text-[var(--color-text-subtle)] sm:pl-0">{formatRelative(e.at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ActivityDot({ kind }: { kind: string }) {
  const color =
    kind === "lead" ? "bg-emerald-400" :
    kind === "campaign" ? "bg-rose-400" :
    kind === "content" ? "bg-fuchsia-400" :
    kind === "seo" ? "bg-amber-400" :
    kind === "automation" ? "bg-sky-400" :
    "bg-slate-400";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}
