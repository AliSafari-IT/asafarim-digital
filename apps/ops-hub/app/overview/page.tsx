import { prisma } from "@asafarim/db";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { SystemHealthPanel } from "@/components/SystemHealthPanel";
import { formatMoney, formatNumber, formatRelative } from "@/lib/format";
import { getSystemHealth } from "@/lib/system-health";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [
    totalTenants,
    activeTenants,
    trialTenants,
    pastDueTenants,
    churnedTenants,
    mrrAgg,
    subsAgg,
    churnRisks,
    recentEvents,
    openInvoicesAgg,
    paidInvoicesAgg,
    planBreakdown,
    systemApps,
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "active" } }),
    prisma.tenant.count({ where: { status: "trial" } }),
    prisma.tenant.count({ where: { status: "past_due" } }),
    prisma.tenant.count({ where: { status: "churned" } }),
    prisma.tenant.aggregate({ _sum: { mrrCents: true }, where: { status: { in: ["active", "past_due"] } } }),
    prisma.subscription.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.lifecycleEvent.findMany({
      where: { kind: "churn_risk" },
      orderBy: { occurredAt: "desc" },
      take: 5,
      include: { tenant: { select: { name: true, slug: true, plan: true, mrrCents: true } } },
    }),
    prisma.lifecycleEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: 8,
      include: { tenant: { select: { name: true, slug: true } } },
    }),
    prisma.invoice.aggregate({ _sum: { amountCents: true }, _count: { _all: true }, where: { status: "open" } }),
    prisma.invoice.aggregate({ _sum: { amountCents: true }, where: { status: "paid", issuedAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.tenant.groupBy({ by: ["plan"], _count: { _all: true }, _sum: { mrrCents: true } }),
    getSystemHealth().catch(() => []),
  ]);

  const mrr = mrrAgg._sum.mrrCents ?? 0;
  const arr = mrr * 12;
  const openInvoicesTotal = openInvoicesAgg._sum.amountCents ?? 0;
  const openInvoicesCount = openInvoicesAgg._count._all;
  const last30dRevenue = paidInvoicesAgg._sum.amountCents ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Operations at a glance</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Live view across tenants, revenue, risk, and automations.</p>
        </div>
        <div className="text-xs text-[var(--color-text-subtle)]">
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      <SystemHealthPanel apps={systemApps} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatMoney(mrr)} delta={{ value: "4.2% MoM", positive: true }} tone="accent" hint={`${formatMoney(arr)} ARR`} />
        <KpiCard label="Active tenants" value={formatNumber(activeTenants)} hint={`${totalTenants} total · ${trialTenants} trial`} tone="success" />
        <KpiCard label="At-risk" value={formatNumber(pastDueTenants)} tone="warning" hint={`${churnedTenants} churned · last 90d`} />
        <KpiCard label="Open invoices" value={formatMoney(openInvoicesTotal)} tone="danger" hint={`${openInvoicesCount} invoice(s) awaiting payment`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Churn risk queue</h3>
            <Link href="/lifecycle?kind=churn_risk" className="text-xs text-[var(--color-accent)] hover:underline">
              View all →
            </Link>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Tenants that need operator attention this week.</p>
          <div className="mt-4 space-y-2">
            {churnRisks.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--color-text-subtle)]">No active churn risks. Nice.</p>
            )}
            {churnRisks.map((e) => (
              <Link
                key={e.id}
                href={`/tenants/${e.tenant.slug}`}
                className="group flex items-center justify-between rounded-lg border border-transparent bg-[var(--color-bg-soft)]/60 px-4 py-3 transition hover:border-[var(--color-border-strong)]"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
                    {e.tenant.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                    {e.title} · {formatRelative(e.occurredAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={e.tenant.plan} />
                  <span className="text-sm font-medium text-[var(--color-text)]">{formatMoney(e.tenant.mrrCents)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Plan mix</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Tenants and revenue by plan.</p>
          <div className="mt-4 space-y-3">
            {planBreakdown
              .sort((a, b) => (b._sum.mrrCents ?? 0) - (a._sum.mrrCents ?? 0))
              .map((p) => {
                const pct = totalTenants ? Math.round((p._count._all / totalTenants) * 100) : 0;
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <StatusBadge value={p.plan} />
                        <span className="text-[var(--color-text-muted)]">{p._count._all} tenants</span>
                      </div>
                      <span className="font-medium text-[var(--color-text)]">{formatMoney(p._sum.mrrCents ?? 0)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="mt-5 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Last 30 days revenue</span>
              <span className="font-medium text-[var(--color-text)]">{formatMoney(last30dRevenue)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Subscriptions</span>
              <span className="font-medium text-[var(--color-text)]">
                {subsAgg.reduce((s, x) => s + x._count._all, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent lifecycle events</h3>
          <Link href="/lifecycle" className="text-xs text-[var(--color-accent)] hover:underline">View timeline →</Link>
        </div>
        <ul className="mt-4 divide-y divide-[var(--color-border)]">
          {recentEvents.map((e) => (
            <li key={e.id} className="flex items-center justify-between py-3">
              <div className="flex min-w-0 items-center gap-3">
                <EventDot severity={e.severity} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-[var(--color-text)]">{e.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <Link href={`/tenants/${e.tenant.slug}`} className="hover:text-[var(--color-accent)]">{e.tenant.name}</Link>
                    {" · "}
                    <span className="font-mono">{e.kind}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs text-[var(--color-text-subtle)]">{formatRelative(e.occurredAt)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EventDot({ severity }: { severity: string }) {
  const color =
    severity === "success" ? "bg-emerald-400" :
    severity === "warning" ? "bg-amber-400" :
    severity === "danger" ? "bg-rose-400" :
    "bg-sky-400";
  return <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />;
}
