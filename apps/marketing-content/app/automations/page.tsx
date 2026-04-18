import { SectionHeader } from "@/components/SectionHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatNumber, formatPercent, formatRelative } from "@/lib/format";
import { automations } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

const CATEGORIES: Array<{ key: "nurture" | "routing" | "publishing" | "reporting"; label: string; description: string }> = [
  { key: "nurture",    label: "Nurture",    description: "Lifecycle + re-engagement email flows." },
  { key: "routing",    label: "Routing",    description: "Lead routing to AEs, CSMs, and Slack." },
  { key: "publishing", label: "Publishing", description: "Content syndication and scheduling." },
  { key: "reporting",  label: "Reporting",  description: "KPI digests and alerting jobs." },
];

export default function AutomationsPage() {
  const healthy = automations.filter((a) => a.status === "healthy").length;
  const warning = automations.filter((a) => a.status === "warning").length;
  const failed = automations.filter((a) => a.status === "failed").length;
  const runs24h = automations.reduce((s, a) => s + a.runs24h, 0);

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Automations"
        title="Marketing automations"
        description="Rules and scheduled jobs that move leads, publish content, and alert the team."
        actions={
          <button className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110">
            + New rule
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Healthy" value={formatNumber(healthy)} tone="success" hint={`${automations.length} total rules`} />
        <KpiCard label="Warning" value={formatNumber(warning)} tone="warning" />
        <KpiCard label="Failed" value={formatNumber(failed)} tone="danger" />
        <KpiCard label="Runs 24h" value={formatNumber(runs24h)} tone="accent" />
      </div>

      {CATEGORIES.map((cat) => {
        const rules = automations.filter((a) => a.category === cat.key);
        if (rules.length === 0) return null;
        return (
          <section key={cat.key} className="space-y-3">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">{cat.label}</h2>
                <p className="text-xs text-[var(--color-text-muted)]">{cat.description}</p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wide text-[var(--color-text-subtle)]">
                {rules.length} rule{rules.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {rules.map((a) => (
                <div key={a.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-[var(--color-text)]">{a.name}</p>
                    <StatusBadge value={a.status} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">{a.description}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Metric label="Runs 24h" value={formatNumber(a.runs24h)} />
                    <Metric label="Success" value={formatPercent(a.successRate, 1)} />
                    <Metric label="Last run" value={formatRelative(a.lastRunAt)} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 p-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">{label}</p>
      <p className="mt-0.5 font-mono text-xs text-[var(--color-text)]">{value}</p>
    </div>
  );
}
