interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean } | null;
  hint?: string;
  tone?: "default" | "accent" | "success" | "warning" | "danger" | "brand";
}

const toneRing: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "from-slate-600/20 to-slate-800/0",
  accent: "from-fuchsia-500/25 to-fuchsia-900/0",
  success: "from-emerald-500/25 to-emerald-900/0",
  warning: "from-amber-500/25 to-amber-900/0",
  danger: "from-rose-500/25 to-rose-900/0",
  brand: "from-rose-500/30 to-amber-500/0",
};

export function KpiCard({ label, value, delta, hint, tone = "default" }: KpiCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className={`pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-gradient-to-br ${toneRing[tone]} blur-3xl`} />
      <div className="relative">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-2xl font-semibold text-[var(--color-text)]">{value}</p>
          {delta && (
            <span className={`text-xs font-medium ${delta.positive ? "text-emerald-400" : "text-rose-400"}`}>
              {delta.positive ? "▲" : "▼"} {delta.value}
            </span>
          )}
        </div>
        {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    </div>
  );
}
