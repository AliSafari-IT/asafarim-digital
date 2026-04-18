import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatNumber, formatRelative } from "@/lib/format";
import { campaigns, contentAssets } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const PIPELINE: Array<{ status: "brief" | "drafting" | "review" | "scheduled" | "published"; label: string }> = [
  { status: "brief",     label: "Brief" },
  { status: "drafting",  label: "Drafting" },
  { status: "review",    label: "Review" },
  { status: "scheduled", label: "Scheduled" },
  { status: "published", label: "Published" },
];

export default function ContentPage() {
  const byStatus = (s: string) => contentAssets.filter((a) => a.status === s);
  const totalWords = contentAssets.reduce((s, a) => s + a.wordCount, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Content"
        title="Editorial pipeline"
        description="Content assets moving from brief to published, mapped to the campaigns they serve."
        actions={
          <button className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110">
            + New brief
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="In pipeline" value={formatNumber(contentAssets.length)} tone="brand" />
        <KpiCard label="Published" value={formatNumber(byStatus("published").length)} tone="success" />
        <KpiCard label="In review" value={formatNumber(byStatus("review").length)} tone="warning" />
        <KpiCard label="Words in pipeline" value={formatNumber(totalWords)} hint="Across all asset types" />
      </div>

      {/* Kanban */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {PIPELINE.map((col) => {
          const items = byStatus(col.status);
          return (
            <div key={col.status} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{col.label}</h3>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-[var(--color-text-subtle)]">
                  {items.length}
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-[var(--color-border)] px-3 py-6 text-center text-xs text-[var(--color-text-subtle)]">
                    Empty
                  </p>
                )}
                {items.map((a) => {
                  const camp = a.campaignId ? campaigns.find((c) => c.id === a.campaignId) : null;
                  return (
                    <div key={a.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 p-3">
                      <p className="text-sm font-medium leading-snug text-[var(--color-text)]">{a.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="rounded bg-white/5 px-1.5 py-0.5 text-[var(--color-text-muted)]">{a.type}</span>
                        <span className="text-[var(--color-text-subtle)]">· {a.owner}</span>
                      </div>
                      {camp && (
                        <p className="mt-1.5 truncate text-[10px] text-[var(--color-text-subtle)]">
                          <span className="text-[var(--color-accent)]">↳</span> {camp.name}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-[var(--color-text-subtle)]">
                        <span>{a.wordCount ? `${formatNumber(a.wordCount)} words` : "—"}</span>
                        <span>{formatRelative(a.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full table view */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-5 py-3">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">All assets</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
            <tr>
              <th className="px-4 py-2 font-semibold">Title</th>
              <th className="px-4 py-2 font-semibold">Type</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Owner</th>
              <th className="px-4 py-2 font-semibold">Campaign</th>
              <th className="px-4 py-2 font-semibold">Publish</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {contentAssets.map((a) => {
              const camp = a.campaignId ? campaigns.find((c) => c.id === a.campaignId) : null;
              return (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{a.title}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{a.type}</td>
                  <td className="px-4 py-3"><StatusBadge value={a.status} /></td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{a.owner}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{camp?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{a.publishAt ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
