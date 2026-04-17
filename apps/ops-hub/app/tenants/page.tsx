import { prisma } from "@asafarim/db";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatNumber, formatRelative } from "@/lib/format";

export const dynamic = "force-dynamic";

interface Search {
  q?: string;
  status?: string;
  plan?: string;
}

export default async function TenantsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const status = sp.status;
  const plan = sp.plan;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [
    { name: { contains: q, mode: "insensitive" } },
    { slug: { contains: q, mode: "insensitive" } },
    { industry: { contains: q, mode: "insensitive" } },
  ];
  if (status && status !== "all") where.status = status;
  if (plan && plan !== "all") where.plan = plan;

  const [tenants, totalAll] = await Promise.all([
    prisma.tenant.findMany({
      where,
      orderBy: [{ mrrCents: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { users: true, subscriptions: true } },
        lifecycleEvents: { orderBy: { occurredAt: "desc" }, take: 1 },
      },
    }),
    prisma.tenant.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Tenants</p>
          <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Tenant directory</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {formatNumber(tenants.length)} of {formatNumber(totalAll)} tenants
          </p>
        </div>
      </div>

      <form className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <input type="search" name="q" placeholder="Search by name, slug, industry…" defaultValue={q} className="max-w-xs" />
        <select name="status" defaultValue={status ?? "all"} className="max-w-[160px]">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="past_due">Past due</option>
          <option value="churned">Churned</option>
          <option value="suspended">Suspended</option>
        </select>
        <select name="plan" defaultValue={plan ?? "all"} className="max-w-[160px]">
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <button type="submit" className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
          Apply
        </button>
        <Link href="/tenants" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
          Clear
        </Link>
      </form>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 text-left text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-5 py-3 font-medium">Tenant</th>
              <th className="px-3 py-3 font-medium">Plan</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium text-right">MRR</th>
              <th className="px-3 py-3 font-medium text-right">Seats</th>
              <th className="px-3 py-3 font-medium">Region</th>
              <th className="px-3 py-3 font-medium">Latest event</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {tenants.map((t) => (
              <tr key={t.id} className="transition hover:bg-white/[0.03]">
                <td className="px-5 py-3">
                  <Link href={`/tenants/${t.slug}`} className="group">
                    <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)]">{t.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)] font-mono">{t.slug} · {t.industry ?? "—"}</p>
                  </Link>
                </td>
                <td className="px-3 py-3"><StatusBadge value={t.plan} /></td>
                <td className="px-3 py-3"><StatusBadge value={t.status} /></td>
                <td className="px-3 py-3 text-right font-medium text-[var(--color-text)]">{formatMoney(t.mrrCents)}</td>
                <td className="px-3 py-3 text-right text-[var(--color-text-muted)]">{t.seats}</td>
                <td className="px-3 py-3 text-[var(--color-text-muted)]">{t.region}</td>
                <td className="px-3 py-3 text-xs">
                  {t.lifecycleEvents[0] ? (
                    <div>
                      <p className="text-[var(--color-text)]">{t.lifecycleEvents[0].title}</p>
                      <p className="text-[var(--color-text-subtle)]">{formatRelative(t.lifecycleEvents[0].occurredAt)}</p>
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-subtle)]">—</span>
                  )}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-sm text-[var(--color-text-muted)]">
                  No tenants match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
