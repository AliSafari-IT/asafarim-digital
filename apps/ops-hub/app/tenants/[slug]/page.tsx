import { prisma } from "@asafarim/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatMoney, formatNumber, formatDate, formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      users: { select: { id: true, name: true, email: true, image: true, isActive: true, createdAt: true }, take: 10 },
      subscriptions: {
        include: { plan: true, invoices: { orderBy: { issuedAt: "desc" }, take: 5 } },
        orderBy: { createdAt: "desc" },
      },
      featureOverrides: { include: { flag: true } },
      lifecycleEvents: { orderBy: { occurredAt: "desc" }, take: 20 },
      usageMetrics: { orderBy: { periodStart: "desc" }, take: 12 },
    },
  });
  if (!tenant) notFound();

  const apiCalls = tenant.usageMetrics.filter((m) => m.metric === "api_calls").slice(0, 6);
  const activeUsers = tenant.usageMetrics.filter((m) => m.metric === "active_users").slice(0, 6);
  const maxCalls = Math.max(1, ...apiCalls.map((m) => m.value));
  const latestSub = tenant.subscriptions[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/tenants" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">← All tenants</Link>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{tenant.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">{tenant.slug}</span>
            <span>·</span>
            <span>{tenant.industry ?? "—"}</span>
            <span>·</span>
            <span>{tenant.region}</span>
            <span>·</span>
            <span>Since {formatDate(tenant.createdAt)}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge value={tenant.plan} />
            <StatusBadge value={tenant.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="MRR" value={formatMoney(tenant.mrrCents)} tone="accent" hint={`${formatMoney(tenant.mrrCents * 12)} ARR`} />
        <KpiCard label="Seats" value={formatNumber(tenant.seats)} hint={`${tenant.users.length} user${tenant.users.length === 1 ? "" : "s"} linked`} />
        <KpiCard
          label="Subscription"
          value={latestSub?.plan.name ?? "—"}
          tone={latestSub?.status === "past_due" ? "warning" : latestSub?.status === "active" ? "success" : "default"}
          hint={latestSub ? `Renews ${formatDate(latestSub.renewsAt)}` : "None"}
        />
        <KpiCard
          label="Feature overrides"
          value={formatNumber(tenant.featureOverrides.length)}
          hint={tenant.featureOverrides.length ? `${tenant.featureOverrides.filter((o) => o.enabled).length} enabled` : "Using defaults"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Usage */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Weekly API calls</h3>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Last 6 weeks of usage.</p>
            <div className="mt-4 flex items-end gap-2 h-28">
              {apiCalls.slice().reverse().map((m) => (
                <div key={m.id} className="group relative flex flex-1 flex-col items-center">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/60 to-cyan-400/80 transition hover:from-indigo-400/70 hover:to-cyan-300"
                    style={{ height: `${(m.value / maxCalls) * 100}%` }}
                  />
                  <span className="mt-1 text-[10px] text-[var(--color-text-subtle)]">{formatDate(m.periodStart).slice(0, 6)}</span>
                  <span className="absolute -top-6 hidden rounded bg-[var(--color-surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--color-text)] group-hover:block">
                    {formatNumber(m.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-3 text-xs">
              <span className="text-[var(--color-text-muted)]">Active users (latest week)</span>
              <span className="font-medium text-[var(--color-text)]">{formatNumber(activeUsers[0]?.value ?? 0)}</span>
            </div>
          </section>

          {/* Subscription + invoices */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">Billing</h3>
              <Link href="/billing" className="text-xs text-[var(--color-accent)] hover:underline">Open billing →</Link>
            </div>
            {latestSub ? (
              <>
                <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
                  <Meta label="Plan" value={latestSub.plan.name} />
                  <Meta label="Status" value={<StatusBadge value={latestSub.status} />} />
                  <Meta label="Seats" value={String(latestSub.seats)} />
                  <Meta label="Renews" value={formatDate(latestSub.renewsAt)} />
                </div>
                <table className="mt-5 w-full text-sm">
                  <thead className="border-b border-[var(--color-border)] text-left text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Invoice</th>
                      <th className="py-2 pr-4 font-medium">Issued</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {latestSub.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2 pr-4 font-mono text-xs text-[var(--color-text)]">{inv.number}</td>
                        <td className="py-2 pr-4 text-[var(--color-text-muted)]">{formatDate(inv.issuedAt)}</td>
                        <td className="py-2 pr-4"><StatusBadge value={inv.status} /></td>
                        <td className="py-2 text-right font-medium text-[var(--color-text)]">{formatMoney(inv.amountCents, inv.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="mt-4 text-sm text-[var(--color-text-muted)]">No active subscription.</p>
            )}
          </section>

          {/* Users */}
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Users ({tenant.users.length})</h3>
            {tenant.users.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">No users assigned to this tenant yet.</p>
            ) : (
              <ul className="mt-4 divide-y divide-[var(--color-border)]">
                {tenant.users.map((u) => (
                  <li key={u.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <p className="text-[var(--color-text)]">{u.name ?? u.email}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                    </div>
                    <StatusBadge value={u.isActive ? "active" : "suspended"} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar: lifecycle + overrides */}
        <div className="space-y-6">
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Lifecycle timeline</h3>
            <ol className="mt-4 space-y-4">
              {tenant.lifecycleEvents.map((e) => (
                <li key={e.id} className="relative pl-5">
                  <span className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${severityDot(e.severity)}`} />
                  <span className="absolute left-[3px] top-3.5 h-full w-px bg-[var(--color-border)]" />
                  <p className="text-sm text-[var(--color-text)]">{e.title}</p>
                  {e.details && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{e.details}</p>}
                  <p className="mt-1 text-[11px] text-[var(--color-text-subtle)]">
                    <span className="font-mono">{e.kind}</span> · {formatRelative(e.occurredAt)}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Feature overrides</h3>
            {tenant.featureOverrides.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--color-text-muted)]">Inheriting global defaults.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {tenant.featureOverrides.map((o) => (
                  <li key={o.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[var(--color-text)]">{o.flag.name}</p>
                      {o.note && <p className="text-xs text-[var(--color-text-muted)]">{o.note}</p>}
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--color-text-subtle)]">{o.flag.code}</p>
                    </div>
                    <StatusBadge value={o.enabled ? "enabled" : "disabled"} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">{label}</p>
      <div className="mt-1 text-sm text-[var(--color-text)]">{value}</div>
    </div>
  );
}

function severityDot(severity: string): string {
  return severity === "success" ? "bg-emerald-400 ring-2 ring-emerald-500/30" :
    severity === "warning" ? "bg-amber-400 ring-2 ring-amber-500/30" :
    severity === "danger" ? "bg-rose-400 ring-2 ring-rose-500/30" :
    "bg-sky-400 ring-2 ring-sky-500/30";
}
