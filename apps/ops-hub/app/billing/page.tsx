import { prisma } from "@asafarim/db";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatMoney, formatNumber, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "all";

  const invoiceWhere: Record<string, unknown> = status === "all" ? {} : { status };

  const [mrrAgg, openAgg, paidLast30, failedCount, invoices, subs] = await Promise.all([
    prisma.tenant.aggregate({ _sum: { mrrCents: true }, where: { status: { in: ["active", "past_due"] } } }),
    prisma.invoice.aggregate({ _sum: { amountCents: true }, _count: { _all: true }, where: { status: "open" } }),
    prisma.invoice.aggregate({ _sum: { amountCents: true }, where: { status: "paid", issuedAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
    prisma.invoice.count({ where: { status: "failed" } }),
    prisma.invoice.findMany({
      where: invoiceWhere,
      orderBy: { issuedAt: "desc" },
      take: 50,
      include: { subscription: { include: { tenant: true, plan: true } } },
    }),
    prisma.subscription.findMany({
      include: { tenant: { select: { name: true, slug: true } }, plan: true },
      orderBy: { mrrCents: "desc" },
      take: 20,
    }),
  ]);

  const mrr = mrrAgg._sum.mrrCents ?? 0;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Billing</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Subscriptions & invoices</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Live billing state — Stripe sync is stubbed but the data shape is ready.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatMoney(mrr)} tone="accent" hint={`${formatMoney(mrr * 12)} ARR`} />
        <KpiCard label="Paid (30d)" value={formatMoney(paidLast30._sum.amountCents ?? 0)} tone="success" />
        <KpiCard label="Open" value={formatMoney(openAgg._sum.amountCents ?? 0)} tone="warning" hint={`${openAgg._count._all} invoice(s)`} />
        <KpiCard label="Failed" value={formatNumber(failedCount)} tone="danger" hint="Charge retry pending" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent invoices</h3>
            <form className="flex items-center gap-2">
              <select name="status" defaultValue={status} className="max-w-[140px]">
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="open">Open</option>
                <option value="failed">Failed</option>
                <option value="void">Void</option>
              </select>
              <button className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110">Apply</button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg-soft)]/60 text-left text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Invoice</th>
                  <th className="px-3 py-3 font-medium">Tenant</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Issued</th>
                  <th className="px-3 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition hover:bg-white/[0.03]">
                    <td className="px-5 py-3 font-mono text-xs text-[var(--color-text)]">{inv.number}</td>
                    <td className="px-3 py-3">
                      <Link href={`/tenants/${inv.subscription.tenant.slug}`} className="text-[var(--color-text)] hover:text-[var(--color-accent)]">
                        {inv.subscription.tenant.name}
                      </Link>
                      <p className="text-[11px] text-[var(--color-text-subtle)]">{inv.subscription.plan.name}</p>
                    </td>
                    <td className="px-3 py-3"><StatusBadge value={inv.status} /></td>
                    <td className="px-3 py-3 text-[var(--color-text-muted)]">{formatDate(inv.issuedAt)}</td>
                    <td className="px-3 py-3 text-right font-medium text-[var(--color-text)]">{formatMoney(inv.amountCents, inv.currency)}</td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">No invoices.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Top subscriptions</h3>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">By MRR contribution.</p>
          <ul className="mt-4 space-y-3">
            {subs.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/tenants/${s.tenant.slug}`} className="truncate text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]">
                    {s.tenant.name}
                  </Link>
                  <p className="text-[11px] text-[var(--color-text-subtle)]">
                    {s.plan.name} · {s.seats} seat{s.seats === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={s.status} compact />
                  <span className="text-sm font-medium text-[var(--color-text)]">{formatMoney(s.mrrCents)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
