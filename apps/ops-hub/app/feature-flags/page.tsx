import { prisma } from "@asafarim/db";
import { StatusBadge } from "@/components/StatusBadge";
import { FlagToggle } from "./FlagToggle";
import { requireOps } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function FeatureFlagsPage() {
  const session = await requireOps("read");
  const flags = await prisma.featureFlag.findMany({
    orderBy: [{ category: "asc" }, { code: "asc" }],
    include: { _count: { select: { overrides: true } } },
  });

  const grouped = flags.reduce<Record<string, typeof flags>>((acc, f) => {
    acc[f.category] = acc[f.category] ? [...acc[f.category], f] : [f];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">Feature Flags</p>
        <h1 className="mt-1 text-2xl font-semibold text-[var(--color-text)]">Release control</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Per-tenant feature access with global rollout targeting. {session.canWrite ? "" : "Read-only view."}
        </p>
      </div>

      {Object.entries(grouped).map(([category, list]) => (
        <section key={category} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-[var(--color-text)] capitalize">{category}</h3>
              <span className="text-xs text-[var(--color-text-subtle)]">{list.length} flag{list.length === 1 ? "" : "s"}</span>
            </div>
          </div>
          <ul className="divide-y divide-[var(--color-border)]">
            {list.map((f) => (
              <li key={f.id} className="flex items-start justify-between gap-6 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--color-text)]">{f.name}</p>
                    <code className="rounded bg-white/5 px-1.5 py-0.5 text-[11px] text-[var(--color-text-muted)] font-mono">{f.code}</code>
                    {category === "killswitch" && <StatusBadge value="killswitch" tone="danger" />}
                  </div>
                  {f.description && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{f.description}</p>}
                  <div className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-subtle)]">
                    <span>Rollout: <span className="text-[var(--color-text)]">{f.rolloutPercent}%</span></span>
                    <span>Overrides: <span className="text-[var(--color-text)]">{f._count.overrides}</span></span>
                    <span>Default: <StatusBadge value={f.defaultEnabled ? "enabled" : "disabled"} compact /></span>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${f.rolloutPercent}%` }} />
                  </div>
                </div>
                <div className="shrink-0">
                  <FlagToggle id={f.id} defaultEnabled={f.defaultEnabled} canWrite={session.canWrite} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
