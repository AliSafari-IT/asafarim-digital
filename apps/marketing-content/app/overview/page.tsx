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
} from "@/lib/demo-data";
import { getGrowthOverview } from "@/lib/growth-data";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const growth = await getGrowthOverview(30).catch(() => null);

  const liveCampaigns = campaigns.filter((c) => c.status === "live");
  const totalConversions = liveCampaigns.reduce((s, c) => s + c.conversions, 0);
  const totalSpent = liveCampaigns.reduce((s, c) => s + c.spentCents, 0);
  const publishedThisMonth = contentAssets.filter((a) => a.status === "published").length;
  const automationRuns24h = automations.reduce((s, a) => s + a.runs24h, 0);
  const latestWeek = analyticsWeekly[analyticsWeekly.length - 1];
  const prevWeek = analyticsWeekly[analyticsWeekly.length - 2];
  const organicDeltaPct = ((latestWeek.visitors - prevWeek.visitors) / prevWeek.visitors) * 100;

  const signups30d = growth?.signups ?? 0;
  const mqls30d = growth?.mqls ?? 0;
  const sqls30d = growth?.sqls ?? 0;
  const won30d = growth?.won ?? 0;
  const signupToMql = signups30d ? mqls30d / signups30d : 0;
  const mqlToSql = mqls30d ? sqls30d / mqls30d : 0;
  const sqlToWon = sqls30d ? won30d / sqls30d : 0;
  const attributedPct = signups30d && growth ? growth.attributedSignups / signups30d : 0;

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
          label="Signups (30d)"
          value={formatNumber(signups30d)}
          hint={`${formatNumber(mqls30d)} MQL · ${formatNumber(sqls30d)} SQL`}
          tone="accent"
        />
        <KpiCard
          label="Organic traffic / wk"
          value={formatCompact(latestWeek.visitors)}
          delta={{ value: `${organicDeltaPct.toFixed(1)}% WoW`, positive: organicDeltaPct > 0 }}
          tone="success"
          hint="demo (wire to analytics later)"
        />
        <KpiCard
          label="Attributed signups"
          value={formatPercent(attributedPct, 0)}
          hint={growth ? `${growth.attributedSignups} of ${signups30d} tracked` : "no data yet"}
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
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Funnel (30 days)</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Live signals from portal signups.</p>
          <div className="mt-4 space-y-3">
            {(growth?.funnel ?? []).map((row) => {
              const pct = Math.max(1, Math.round((row.value / Math.max(1, row.max)) * 100));
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
            {!growth && (
              <p className="py-4 text-center text-xs text-[var(--color-text-subtle)]">
                No growth data available.
              </p>
            )}
          </div>
          <div className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center justify-between">
              <span>Signup → MQL</span>
              <span className="font-medium text-[var(--color-text)]">{formatPercent(signupToMql, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>MQL → SQL</span>
              <span className="font-medium text-[var(--color-text)]">{formatPercent(mqlToSql, 0)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>SQL → Won</span>
              <span className="font-medium text-[var(--color-text)]">{formatPercent(sqlToWon, 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Acquisition channels */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Acquisition channels</h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              Top UTM sources driving signups in the last 30 days.
            </p>
          </div>
          <Link href="/leads" className="text-xs text-[var(--color-accent)] hover:underline">
            All leads →
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {(growth?.channels ?? []).length === 0 && (
            <p className="py-6 text-center text-xs text-[var(--color-text-subtle)]">
              No attributed signups yet. Share links with <code className="font-mono">?utm_source=...&amp;utm_medium=...&amp;utm_campaign=...</code> to start tracking.
            </p>
          )}
          {(growth?.channels ?? []).map((c) => {
            const pct = Math.max(2, Math.round(c.pct * 100));
            return (
              <div key={`${c.source}:${c.medium ?? ""}`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--color-text)]">{c.source}</span>
                    {c.medium && <StatusBadge value={c.medium} />}
                  </div>
                  <span className="font-mono text-[var(--color-text-muted)]">
                    {formatNumber(c.count)} · {formatPercent(c.pct, 0)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent signups</h3>
          <Link href="/leads" className="text-xs text-[var(--color-accent)] hover:underline">
            All leads →
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {(growth?.recentSignups ?? []).length === 0 && (
            <li className="py-6 text-center text-xs text-[var(--color-text-subtle)]">
              No signups in the last 30 days.
            </li>
          )}
          {(growth?.recentSignups ?? []).map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <SignupDot source={s.utmSource} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--color-text)]">
                    {s.name || s.email}
                    {s.tenantName && (
                      <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                        · {s.tenantName}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-[var(--color-text-muted)]">
                    {s.utmSource ? (
                      <>
                        <span className="font-mono">{s.utmSource}</span>
                        {s.utmMedium && <span> / {s.utmMedium}</span>}
                        {s.utmCampaign && <span> · {s.utmCampaign}</span>}
                      </>
                    ) : (
                      <span className="italic">direct / unattributed</span>
                    )}
                    {s.tenantPlan && (
                      <span className="ml-2">· plan <span className="font-mono">{s.tenantPlan}</span></span>
                    )}
                  </p>
                </div>
              </div>
              <span className="pl-5 text-xs text-[var(--color-text-subtle)] sm:pl-0">
                {formatRelative(s.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SignupDot({ source }: { source: string | null }) {
  const color = !source
    ? "bg-slate-400"
    : /google|bing|search/i.test(source)
    ? "bg-amber-400"
    : /linkedin|twitter|x\.com|social/i.test(source)
    ? "bg-sky-400"
    : /email|newsletter/i.test(source)
    ? "bg-fuchsia-400"
    : /paid|ads|ppc|cpc/i.test(source)
    ? "bg-rose-400"
    : "bg-emerald-400";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}
