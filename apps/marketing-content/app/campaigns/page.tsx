import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { listCampaigns, getCurrentUserId } from "@/lib/campaigns";
import { NewCampaignButton } from "./NewCampaignButton";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const userId = await getCurrentUserId();
  const campaigns = await listCampaigns(userId);

  const totalBudget = campaigns.reduce((s, c) => s + c.budgetCents, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spentCents, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const cvr = totalClicks ? totalConversions / totalClicks : 0;
  const channelList: Array<"seo" | "email" | "paid" | "social" | "partner"> = ["seo", "email", "paid", "social", "partner"];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Campaigns"
        title="Campaign performance"
        description="Cross-channel campaigns with owners, budget, and conversion signals. Click any row to view the full performance timeline."
        actions={<NewCampaignButton />}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Budget (period)" value={formatMoney(totalBudget)} tone="brand" hint={`${campaigns.length} campaigns`} />
        <KpiCard label="Spent" value={formatMoney(totalSpent)} hint={`${formatPercent(totalSpent / totalBudget, 0)} of budget`} tone="warning" />
        <KpiCard label="Conversions" value={formatNumber(totalConversions)} tone="success" />
        <KpiCard label="Click → conv." value={formatPercent(cvr, 2)} hint={`${formatNumber(totalClicks)} clicks total`} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[var(--color-text-subtle)]">Filter:</span>
        <span className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-accent)]">
          All channels
        </span>
        {channelList.map((ch) => (
          <span key={ch} className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)]">
            {ch}
          </span>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-4 py-3 font-semibold">Campaign</th>
              <th className="px-4 py-3 font-semibold">Channel</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Owner</th>
              <th className="px-4 py-3 font-semibold text-right">Budget</th>
              <th className="px-4 py-3 font-semibold text-right">Spent</th>
              <th className="px-4 py-3 font-semibold text-right">Conv.</th>
              <th className="px-4 py-3 font-semibold text-right">CPA</th>
              <th className="px-4 py-3 font-semibold">Progress</th>
              <th className="px-4 py-3 font-semibold text-center">Entries</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {campaigns.map((c) => {
              const cpa = c.conversions ? c.spentCents / c.conversions : 0;
              const progressPct = c.budgetCents ? Math.min(100, Math.round((c.spentCents / c.budgetCents) * 100)) : 0;
              const count = c.entryCount;
              return (
                <tr
                  key={c.id}
                  className="group hover:bg-white/[0.025] transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link href={`/campaigns/${c.id}`} className="block">
                      <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                        {c.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">Started {c.startedAt}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge value={c.channel} /></td>
                  <td className="px-4 py-3"><StatusBadge value={c.status} /></td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.owner}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatMoney(c.budgetCents)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{formatMoney(c.spentCents)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text)]">{formatNumber(c.conversions)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{cpa ? formatMoney(cpa) : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full ${progressPct > 90 ? "bg-rose-500" : progressPct > 60 ? "bg-amber-400" : "bg-emerald-400"}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] text-[var(--color-text-subtle)]">{progressPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/campaigns/${c.id}`}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${count > 0 ? "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30 hover:bg-rose-500/25" : "bg-white/[0.04] text-[var(--color-text-subtle)] hover:bg-white/[0.08]"}`}
                    >
                      {count > 0 ? (
                        <>
                          <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
                            <path d="M1.5 7.5l3-5 3 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {count}w
                        </>
                      ) : (
                        <span>Log →</span>
                      )}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-[var(--color-text-subtle)]">
        Click a campaign name or its entry count to open the performance timeline and log new data.
      </p>
    </div>
  );
}
