import { prisma } from "@asafarim/db";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tenant?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const tenantSlug = sp.tenant;

  const where: Record<string, unknown> = {};
  if (q) where.OR = [
    { email: { contains: q, mode: "insensitive" } },
    { name: { contains: q, mode: "insensitive" } },
    { username: { contains: q, mode: "insensitive" } },
  ];
  if (tenantSlug) where.tenant = { slug: tenantSlug };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        tenant: { select: { name: true, slug: true, plan: true } },
        userRoles: { include: { role: { select: { name: true, displayName: true } } } },
      },
    }),
    prisma.user.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Users</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">User directory</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{users.length} of {total} users</p>
      </div>

      <form className="flex flex-wrap gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <input type="search" name="q" placeholder="Search by email, name, username…" defaultValue={q} className="max-w-sm" />
        <input type="text" name="tenant" placeholder="Tenant slug…" defaultValue={tenantSlug} className="max-w-[180px]" />
        <button className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white hover:brightness-110">Apply</button>
      </form>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg-soft)]/60 text-left text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-3 py-3 font-medium">Tenant</th>
              <th className="px-3 py-3 font-medium">Roles</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.map((u) => (
              <tr key={u.id} className="transition hover:bg-white/[0.03]">
                <td className="px-5 py-3">
                  <p className="text-[var(--color-text)]">{u.name ?? "—"}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{u.email}</p>
                </td>
                <td className="px-3 py-3">
                  {u.tenant ? (
                    <Link href={`/tenants/${u.tenant.slug}`} className="text-[var(--color-text)] hover:text-[var(--color-accent)]">
                      {u.tenant.name}
                    </Link>
                  ) : <span className="text-[var(--color-text-subtle)]">—</span>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.userRoles.map((ur) => (
                      <span key={ur.role.name} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                        {ur.role.displayName}
                      </span>
                    ))}
                    {u.userRoles.length === 0 && <span className="text-[var(--color-text-subtle)]">—</span>}
                  </div>
                </td>
                <td className="px-3 py-3"><StatusBadge value={u.isActive ? "active" : "suspended"} /></td>
                <td className="px-3 py-3 text-[var(--color-text-muted)]">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[var(--color-text-muted)]">No users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
