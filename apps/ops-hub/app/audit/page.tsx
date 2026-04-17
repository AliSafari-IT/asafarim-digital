import { prisma } from "@asafarim/db";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; action?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.entity) where.entity = sp.entity;
  if (sp.action) where.action = { contains: sp.action, mode: "insensitive" };

  const [logs, entityGroups] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.groupBy({ by: ["entity"], _count: { _all: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Audit Log</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Operator activity</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Every mutation performed through the ops hub is logged here.</p>
      </div>

      <form className="flex flex-wrap gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <select name="entity" defaultValue={sp.entity ?? ""} className="max-w-[200px]">
          <option value="">All entities</option>
          {entityGroups.map((g) => (
            <option key={g.entity} value={g.entity}>{g.entity} ({g._count._all})</option>
          ))}
        </select>
        <input type="search" name="action" placeholder="Action contains…" defaultValue={sp.action ?? ""} className="max-w-xs" />
        <button className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">
          Apply
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-soft)]/60 text-left text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-5 py-3 font-medium">When</th>
              <th className="px-3 py-3 font-medium">Actor</th>
              <th className="px-3 py-3 font-medium">Action</th>
              <th className="px-3 py-3 font-medium">Entity</th>
              <th className="px-3 py-3 font-medium">Target</th>
              <th className="px-3 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {logs.map((l) => (
              <tr key={l.id} className="transition hover:bg-white/[0.03]">
                <td className="px-5 py-3 text-xs text-[var(--color-text-muted)]">{formatDate(l.createdAt)} {new Date(l.createdAt).toLocaleTimeString()}</td>
                <td className="px-3 py-3">{l.user ? (l.user.name ?? l.user.email) : <span className="text-[var(--color-text-subtle)]">system</span>}</td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--color-text)]">{l.action}</td>
                <td className="px-3 py-3 text-[var(--color-text-muted)]">{l.entity}</td>
                <td className="px-3 py-3 font-mono text-xs text-[var(--color-text-subtle)]">{l.entityId?.slice(0, 10) ?? "—"}</td>
                <td className="px-3 py-3 text-xs text-[var(--color-text-subtle)]">{l.ipAddress ?? "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">No audit entries.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
