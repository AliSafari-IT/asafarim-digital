import { prisma } from "@asafarim/db";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

const kinds = ["all", "signup", "activated", "upgraded", "downgraded", "expansion", "churn_risk", "churned", "recovered", "support_ticket"];

export default async function LifecyclePage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const sp = await searchParams;
  const kind = sp.kind ?? "all";
  const where = kind === "all" ? {} : { kind };

  const events = await prisma.lifecycleEvent.findMany({
    where,
    orderBy: { occurredAt: "desc" },
    take: 100,
    include: { tenant: { select: { name: true, slug: true, plan: true, status: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Lifecycle</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Tenant lifecycle timeline</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Activation, expansion, risk, and churn events across your customer base.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <Link
            key={k}
            href={k === "all" ? "/lifecycle" : `/lifecycle?kind=${k}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              kind === k
                ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-text)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
            }`}
          >
            {k.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <ol className="relative space-y-5">
          {events.length === 0 && (
            <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">No events for this filter.</p>
          )}
          {events.map((e) => (
            <li key={e.id} className="relative grid grid-cols-[120px_1fr_auto] items-start gap-4 border-b border-[var(--color-border)] pb-5 last:border-0">
              <div className="text-right">
                <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-subtle)]">{e.kind}</p>
                <p className="mt-0.5 text-[11px] text-[var(--color-text-subtle)]">{formatRelative(e.occurredAt)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-text)]">{e.title}</p>
                {e.details && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{e.details}</p>}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Link href={`/tenants/${e.tenant.slug}`} className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]">
                    {e.tenant.name}
                  </Link>
                  <StatusBadge value={e.tenant.plan} />
                  <StatusBadge value={e.tenant.status} />
                </div>
              </div>
              <div>
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    e.severity === "success" ? "bg-emerald-400" :
                    e.severity === "warning" ? "bg-amber-400" :
                    e.severity === "danger" ? "bg-rose-400" : "bg-sky-400"
                  }`}
                />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
