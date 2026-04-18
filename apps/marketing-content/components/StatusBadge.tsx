type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "accent" | "brand";

const toneStyles: Record<Tone, string> = {
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  danger: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  info: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  neutral: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  accent: "bg-fuchsia-500/15 text-fuchsia-300 ring-fuchsia-500/30",
  brand: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
};

const statusTone: Record<string, Tone> = {
  // campaign / content / automation
  live: "success",
  active: "success",
  published: "success",
  scheduled: "info",
  review: "warning",
  drafting: "warning",
  brief: "neutral",
  paused: "neutral",
  ended: "neutral",
  archived: "neutral",
  failed: "danger",
  warning: "warning",
  healthy: "success",
  // channels
  seo: "info",
  email: "accent",
  paid: "brand",
  social: "warning",
  partner: "neutral",
  // lead stages
  new: "info",
  mql: "accent",
  sql: "brand",
  won: "success",
  lost: "danger",
  // priority
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export function StatusBadge({
  value,
  tone,
  compact = false,
}: {
  value: string;
  tone?: Tone;
  compact?: boolean;
}) {
  const resolvedTone = tone ?? statusTone[value.toLowerCase()] ?? "neutral";
  const label = value.replace(/_/g, " ");
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 ${compact ? "py-0" : "py-0.5"} text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset ${toneStyles[resolvedTone]}`}
    >
      {label}
    </span>
  );
}
