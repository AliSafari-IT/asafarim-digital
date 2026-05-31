"use client";

import { useState, useCallback, useId } from "react";
import Link from "next/link";
import type {
  CampaignView as Campaign,
  PerformanceEntryView as PerformanceEntry,
} from "@/lib/campaigns";
import { logPerformanceEntry } from "../actions";
import { computePacing, cpaStatus, detectAnomalies } from "@/lib/insights";
import { toCsv, downloadCsv, slugify } from "@/lib/csv";
import { StatusBadge } from "@/components/StatusBadge";
import { formatMoney, formatNumber, formatPercent, formatCompact } from "@/lib/format";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(a: number, b: number) { return b ? a / b : 0; }
function delta(curr: number, prev: number) {
  if (!prev) return null;
  const d = (curr - prev) / prev;
  return { pct: d, positive: d >= 0 };
}

function weekLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

type MetricKey = "impressions" | "clicks" | "conversions" | "spentCents";

const METRIC_LABELS: Record<MetricKey, string> = {
  impressions: "Impressions",
  clicks: "Clicks",
  conversions: "Conversions",
  spentCents: "Spend ($)",
};

const METRIC_COLORS: Record<MetricKey, string> = {
  impressions: "#f43f5e",
  clicks: "#a78bfa",
  conversions: "#34d399",
  spentCents: "#fbbf24",
};

function formatMetricValue(key: MetricKey, val: number) {
  if (key === "spentCents") return formatMoney(val);
  return formatCompact(val);
}

interface ChartProps {
  entries: PerformanceEntry[];
  metric: MetricKey;
}

function PerformanceChart({ entries, metric }: ChartProps) {
  const W = 640, H = 180, PAD_L = 8, PAD_R = 8, PAD_T = 12, PAD_B = 24;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const values = entries.map((e) => e[metric] as number);
  const maxV = Math.max(...values, 1);
  const minV = Math.min(...values);

  const xOf = (i: number) => PAD_L + (i / Math.max(entries.length - 1, 1)) * innerW;
  const yOf = (v: number) => PAD_T + innerH - ((v - minV) / Math.max(maxV - minV, 1)) * innerH;

  const points = entries.map((e, i) => ({ x: xOf(i), y: yOf(e[metric] as number), entry: e }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_T + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD_T + innerH).toFixed(1)} Z`;

  const color = METRIC_COLORS[metric];
  const gradId = `chart-grad-${metric}`;

  const [hov, setHov] = useState<number | null>(null);

  const latest = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const trend = latest >= first ? "up" : "down";
  const summary =
    `${METRIC_LABELS[metric]} over ${entries.length} weeks — ` +
    `low ${formatMetricValue(metric, minV)}, high ${formatMetricValue(metric, maxV)}, ` +
    `latest ${formatMetricValue(metric, latest)} (trending ${trend}). ` +
    `Use arrow keys to inspect each week.`;

  function onKeyDown(e: React.KeyboardEvent<SVGSVGElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setHov((h) => {
        const cur = h ?? (e.key === "ArrowRight" ? -1 : entries.length);
        return e.key === "ArrowRight"
          ? Math.min(entries.length - 1, cur + 1)
          : Math.max(0, cur - 1);
      });
    } else if (e.key === "Home") { e.preventDefault(); setHov(0); }
    else if (e.key === "End") { e.preventDefault(); setHov(entries.length - 1); }
    else if (e.key === "Escape") { setHov(null); }
  }

  return (
    <div className="relative w-full select-none" style={{ touchAction: "none" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full rounded outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        style={{ height: 180 }}
        role="img"
        aria-label={summary}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHov(null)}
        onMouseMove={(e) => {
          const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const relX = ((e.clientX - rect.left) / rect.width) * W;
          let best = 0;
          let bestDist = Infinity;
          points.forEach((p, i) => {
            const d = Math.abs(p.x - relX);
            if (d < bestDist) { bestDist = d; best = i; }
          });
          setHov(best);
        }}
      >
        <title>{METRIC_LABELS[metric]} weekly trend</title>
        <desc>{summary}</desc>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((frac) => {
          const y = PAD_T + innerH * (1 - frac);
          return (
            <line key={frac} x1={PAD_L} y1={y} x2={PAD_L + innerW} y2={y}
              stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          );
        })}

        {/* X-axis tick labels */}
        {entries.map((e, i) => {
          if (entries.length > 8 && i % 2 !== 0) return null;
          return (
            <text key={e.id} x={xOf(i)} y={H - 4} textAnchor="middle"
              fontSize="9" fill="rgba(255,255,255,0.3)">
              {weekLabel(e.weekOf)}
            </text>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Hover vertical line */}
        {hov !== null && (
          <line x1={points[hov].x} y1={PAD_T} x2={points[hov].x} y2={PAD_T + innerH}
            stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        )}

        {/* Data point dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hov === i ? 5 : 3}
            fill={color} stroke="var(--color-surface)" strokeWidth="1.5"
            style={{ transition: "r 0.1s" }} />
        ))}
      </svg>

      {/* Tooltip */}
      {hov !== null && (
        <div className="pointer-events-none absolute left-0 top-0 z-10"
          style={{ transform: `translateX(calc(${(hov / Math.max(entries.length - 1, 1)) * 100}% - 50%))`, maxWidth: 180 }}>
          <div className="rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 shadow-xl text-xs">
            <p className="font-semibold text-[var(--color-text)]">{weekLabel(entries[hov].weekOf)}</p>
            <p style={{ color }} className="font-mono text-sm">
              {formatMetricValue(metric, entries[hov][metric] as number)}
            </p>
            {entries[hov].notes && (
              <p className="mt-1 text-[var(--color-text-muted)] line-clamp-2" style={{ maxWidth: 160 }}>
                {entries[hov].notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Screen-reader announcement of the focused/hovered week */}
      <p className="sr-only" aria-live="polite">
        {hov !== null
          ? `Week of ${weekLabel(entries[hov].weekOf)}: ${formatMetricValue(metric, entries[hov][metric] as number)}`
          : ""}
      </p>
    </div>
  );
}


// ─── Log Entry Modal / Slide-over ─────────────────────────────────────────────

interface LogModalProps {
  campaignId: string;
  onClose: () => void;
  onSave: (entry: PerformanceEntry) => void;
}

function LogEntryModal({ campaignId, onClose, onSave }: LogModalProps) {
  const uid = useId();
  const [form, setForm] = useState({
    weekOf: todayIso(),
    impressions: "",
    clicks: "",
    conversions: "",
    spentDollars: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.weekOf) errs.weekOf = "Required";
    if (!form.impressions || isNaN(Number(form.impressions))) errs.impressions = "Enter a valid number";
    if (!form.clicks || isNaN(Number(form.clicks))) errs.clicks = "Enter a valid number";
    if (!form.conversions || isNaN(Number(form.conversions))) errs.conversions = "Enter a valid number";
    if (!form.spentDollars || isNaN(Number(form.spentDollars))) errs.spentDollars = "Enter a valid amount";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    const res = await logPerformanceEntry({
      campaignId,
      weekOf: form.weekOf,
      impressions: form.impressions,
      clicks: form.clicks,
      conversions: form.conversions,
      spentDollars: form.spentDollars,
      notes: form.notes,
    });
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      setFormError(res.error);
      return;
    }
    onSave(res.data);
    onClose();
  }

  // Derived preview KPIs from form values
  const prevImpr = Number(form.impressions) || 0;
  const prevClicks = Number(form.clicks) || 0;
  const prevConv = Number(form.conversions) || 0;
  const prevSpent = (Number(form.spentDollars) || 0) * 100;
  const prevCtr = pct(prevClicks, prevImpr);
  const prevCvr = pct(prevConv, prevClicks);
  const prevCpa = prevConv ? prevSpent / prevConv : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-[var(--color-border-strong)] bg-[var(--color-bg)] shadow-2xl"
        style={{ animation: "slideInRight 0.22s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
          @keyframes fadeInUp {
            from { transform: translateY(8px); opacity: 0; }
            to   { transform: translateY(0);   opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">Performance</p>
            <h2 id={`${uid}-title`} className="text-base font-semibold text-[var(--color-text)]">Log Weekly Entry</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-[var(--color-text)] transition-colors"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-5 px-6 py-5">

            {/* Form-level error */}
            {formError && (
              <div
                role="alert"
                className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
              >
                {formError}
              </div>
            )}

            {/* Week selector */}
            <Field label="Week of (reporting period start)" id={`${uid}-week`} error={errors.weekOf}>
              <input
                id={`${uid}-week`}
                type="date"
                value={form.weekOf}
                onChange={set("weekOf")}
                max={todayIso()}
                className={inputCls(!!errors.weekOf)}
              />
            </Field>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Impressions" id={`${uid}-impr`} error={errors.impressions}>
                <input id={`${uid}-impr`} type="number" min="0" placeholder="e.g. 45 000"
                  value={form.impressions} onChange={set("impressions")}
                  className={inputCls(!!errors.impressions)} />
              </Field>
              <Field label="Clicks" id={`${uid}-clicks`} error={errors.clicks}>
                <input id={`${uid}-clicks`} type="number" min="0" placeholder="e.g. 2 100"
                  value={form.clicks} onChange={set("clicks")}
                  className={inputCls(!!errors.clicks)} />
              </Field>
              <Field label="Conversions" id={`${uid}-conv`} error={errors.conversions}>
                <input id={`${uid}-conv`} type="number" min="0" placeholder="e.g. 84"
                  value={form.conversions} onChange={set("conversions")}
                  className={inputCls(!!errors.conversions)} />
              </Field>
              <Field label="Spend (USD)" id={`${uid}-spend`} error={errors.spentDollars}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] text-sm">$</span>
                  <input id={`${uid}-spend`} type="number" min="0" step="0.01" placeholder="0.00"
                    value={form.spentDollars} onChange={set("spentDollars")}
                    className={`${inputCls(!!errors.spentDollars)} pl-7`} />
                </div>
              </Field>
            </div>

            {/* Live KPI preview */}
            {(prevImpr > 0 || prevClicks > 0) && (
              <div
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-4"
                style={{ animation: "fadeInUp 0.2s ease both" }}
              >
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">
                  Preview · computed metrics
                </p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <MiniKpi label="CTR" value={formatPercent(prevCtr, 2)} color="#a78bfa" />
                  <MiniKpi label="CVR" value={formatPercent(prevCvr, 2)} color="#34d399" />
                  <MiniKpi label="CPA" value={prevCpa ? formatMoney(prevCpa) : "—"} color="#fbbf24" />
                </div>
              </div>
            )}

            {/* Notes */}
            <Field label="Notes & insights (optional)" id={`${uid}-notes`}>
              <textarea
                id={`${uid}-notes`}
                rows={3}
                placeholder="What drove performance this week? Any blockers or wins?"
                value={form.notes}
                onChange={set("notes")}
                className={`${inputCls(false)} resize-none`}
              />
            </Field>
          </div>

          {/* Footer actions */}
          <div className="border-t border-[var(--color-border)] px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" />
                  </svg>
                  Saving…
                </span>
              ) : "Save Entry"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full rounded-lg border ${hasError ? "border-rose-500" : "border-[var(--color-border)]"} bg-[var(--color-surface)]/60 px-3 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 transition-colors`;
}

function Field({
  label, id, error, children,
}: {
  label: string; id: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[var(--color-text-muted)]">{label}</label>
      {children}
      {error && <p className="text-[11px] text-rose-400">{error}</p>}
    </div>
  );
}

function MiniKpi({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs font-bold" style={{ color }}>{value}</span>
      <span className="text-[10px] text-[var(--color-text-subtle)]">{label}</span>
    </div>
  );
}


// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiPanel({
  label, value, sub, color, icon,
}: {
  label: string; value: string; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div
        className="pointer-events-none absolute -top-16 -right-8 h-36 w-36 rounded-full opacity-20 blur-2xl"
        style={{ background: color }}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">{label}</p>
          <p className="mt-1.5 text-xl font-semibold text-[var(--color-text)]">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{sub}</p>}
        </div>
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `${color}22`, color }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ─── Delta pill ────────────────────────────────────────────────────────────────

function DeltaPill({ d }: { d: ReturnType<typeof delta> }) {
  if (!d) return <span className="text-[var(--color-text-subtle)]">—</span>;
  return (
    <span className={`text-xs font-semibold ${d.positive ? "text-emerald-400" : "text-rose-400"}`}>
      {d.positive ? "▲" : "▼"} {formatPercent(Math.abs(d.pct), 1)}
    </span>
  );
}

// ─── Insight banner ─────────────────────────────────────────────────────────────

function InsightBanner({ tone, title, detail }: { tone: "danger" | "warning"; title: string; detail: string }) {
  const styles = tone === "danger"
    ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
    : "border-amber-500/40 bg-amber-500/10 text-amber-200";
  return (
    <div role="alert" className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <svg viewBox="0 0 16 16" fill="none" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M8 1.5l6.5 11.5H1.5L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M8 6.5v3M8 11.2v.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-[var(--color-text-muted)]">{detail}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  campaign: Campaign;
  initialEntries: PerformanceEntry[];
  canManage: boolean;
}

export function CampaignDetail({ campaign, initialEntries, canManage }: Props) {
  const [entries, setEntries] = useState<PerformanceEntry[]>(initialEntries);
  const [showModal, setShowModal] = useState(false);
  const [activeMetric, setActiveMetric] = useState<MetricKey>("impressions");
  const [activeTab, setActiveTab] = useState<"chart" | "table">("chart");

  const handleSave = useCallback((entry: PerformanceEntry) => {
    setEntries((prev) =>
      [...prev, entry].sort((a, b) => a.weekOf.localeCompare(b.weekOf))
    );
  }, []);

  // ── Aggregate KPIs ──────────────────────────────────────────────────────────
  const totImpr  = entries.reduce((s, e) => s + e.impressions, 0);
  const totClicks = entries.reduce((s, e) => s + e.clicks, 0);
  const totConv  = entries.reduce((s, e) => s + e.conversions, 0);
  const totSpent = entries.reduce((s, e) => s + e.spentCents, 0);
  const ctr = pct(totClicks, totImpr);
  const cvr = pct(totConv, totClicks);
  const cpa = totConv ? totSpent / totConv : 0;
  const budgetPct = campaign.budgetCents ? Math.min(1, totSpent / campaign.budgetCents) : 0;

  // ── Derived insights (M3) ─────────────────────────────────────────────────────
  // Use live totals (entries can be appended in-session) for pacing + CPA.
  const liveCampaign: Campaign = { ...campaign, spentCents: totSpent, conversions: totConv };
  const pacing = computePacing(liveCampaign);
  const cpaInfo = cpaStatus(liveCampaign);
  const anomalies = detectAnomalies(entries);

  function exportCsv() {
    const headers = ["Week of", "Impressions", "Clicks", "CTR %", "Conversions", "CVR %", "Spend (USD)", "CPA (USD)", "Notes", "Logged by"];
    const rows = entries.map((e) => {
      const rCtr = pct(e.clicks, e.impressions);
      const rCvr = pct(e.conversions, e.clicks);
      const rCpa = e.conversions ? e.spentCents / e.conversions : 0;
      return [
        e.weekOf, e.impressions, e.clicks, (rCtr * 100).toFixed(2),
        e.conversions, (rCvr * 100).toFixed(2),
        (e.spentCents / 100).toFixed(2),
        rCpa ? (rCpa / 100).toFixed(2) : "",
        e.notes ?? "", e.loggedBy,
      ];
    });
    downloadCsv(`${slugify(campaign.name)}-performance.csv`, toCsv(headers, rows));
  }

  // WoW deltas using last 2 entries
  const last = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const dImpr   = last && prev ? delta(last.impressions, prev.impressions) : null;
  const dClicks = last && prev ? delta(last.clicks, prev.clicks) : null;
  const dConv   = last && prev ? delta(last.conversions, prev.conversions) : null;
  const dSpent  = last && prev ? delta(last.spentCents, prev.spentCents) : null;

  return (
    <div className="space-y-8">
      {/* ── Breadcrumb + Header ── */}
      <div className="space-y-4">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All campaigns
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={campaign.channel} />
              <StatusBadge value={campaign.status} />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)]">{campaign.name}</h1>
            <p className="text-sm text-[var(--color-text-muted)]">
              Owner: <span className="text-[var(--color-text)]">{campaign.owner}</span>
              {" · "}Started {new Date(campaign.startedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              {campaign.endsAt && (
                <>{" · "}Ends {new Date(campaign.endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</>
              )}
              {" · "}Budget: <span className="font-mono text-[var(--color-text)]">{formatMoney(campaign.budgetCents)}</span>
              {campaign.cpaTargetCents != null && (
                <>{" · "}CPA target: <span className="font-mono text-[var(--color-text)]">{formatMoney(campaign.cpaTargetCents)}</span></>
              )}
            </p>
            {campaign.lastEditedBy && campaign.lastEditedAt && (
              <p className="text-xs text-[var(--color-text-subtle)]">
                Last edited by {campaign.lastEditedBy} · {formatTimestamp(campaign.lastEditedAt)}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              disabled={entries.length === 0}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)] transition-colors disabled:opacity-50"
            >
              <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M8 2v8m0 0L5 7m3 3l3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export CSV
            </button>
            {canManage && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Log Performance
              </button>
            )}
          </div>
        </div>

        {/* ── Insight banners (M3) ── */}
        {(pacing && pacing.state !== "ok") || cpaInfo?.over ? (
          <div className="space-y-2">
            {pacing && pacing.state !== "ok" && (
              <InsightBanner
                tone={pacing.state === "over" ? "danger" : "warning"}
                title={pacing.state === "over" ? "Budget pacing: projected overspend" : "Budget pacing: ahead of plan"}
                detail={`${pacing.message} Projected total ${formatMoney(pacing.projectedSpentCents)} vs budget ${formatMoney(campaign.budgetCents)}.`}
              />
            )}
            {cpaInfo?.over && (
              <InsightBanner
                tone="danger"
                title="CPA above target"
                detail={`Current CPA ${formatMoney(cpaInfo.cpaCents)} is ${formatPercent(cpaInfo.ratio - 1, 0)} over the ${formatMoney(cpaInfo.targetCents)} target.`}
              />
            )}
          </div>
        ) : null}

        {/* Budget progress bar */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-[var(--color-text-muted)]">Budget utilisation</span>
            <span className="font-mono font-semibold text-[var(--color-text)]">
              {formatMoney(totSpent)} / {formatMoney(campaign.budgetCents)}
              <span className={`ml-2 ${budgetPct > 0.9 ? "text-rose-400" : budgetPct > 0.6 ? "text-amber-400" : "text-emerald-400"}`}>
                ({formatPercent(budgetPct, 0)})
              </span>
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${budgetPct > 0.9 ? "bg-rose-500" : budgetPct > 0.6 ? "bg-amber-400" : "bg-emerald-400"}`}
              style={{ width: `${(budgetPct * 100).toFixed(1)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        <div className="col-span-2 sm:col-span-1">
          <KpiPanel label="Impressions" value={formatCompact(totImpr)}
            sub={dImpr ? `${dImpr.positive ? "+" : ""}${formatPercent(dImpr.pct, 1)} WoW` : undefined}
            color="#f43f5e" icon={<EyeIcon />} />
        </div>
        <KpiPanel label="Clicks" value={formatCompact(totClicks)}
          sub={dClicks ? `${dClicks.positive ? "+" : ""}${formatPercent(dClicks.pct, 1)} WoW` : undefined}
          color="#a78bfa" icon={<CursorIcon />} />
        <KpiPanel label="CTR" value={formatPercent(ctr, 2)} color="#818cf8" icon={<PercentIcon />} />
        <KpiPanel label="Conversions" value={formatNumber(totConv)}
          sub={dConv ? `${dConv.positive ? "+" : ""}${formatPercent(dConv.pct, 1)} WoW` : undefined}
          color="#34d399" icon={<CheckIcon />} />
        <KpiPanel label="CVR" value={formatPercent(cvr, 2)} color="#6ee7b7" icon={<TrendIcon />} />
        <KpiPanel label="Total Spend" value={formatMoney(totSpent)}
          sub={dSpent ? `${dSpent.positive ? "+" : ""}${formatPercent(dSpent.pct, 1)} WoW` : undefined}
          color="#fbbf24" icon={<DollarIcon />} />
        <KpiPanel label="CPA" value={cpa ? formatMoney(cpa) : "—"} color="#fb923c" icon={<TargetIcon />} />
      </div>

      {/* ── Chart + Table tabs ── */}
      {entries.length > 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
            <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
              {(["chart", "table"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${activeTab === t ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
                >
                  {t === "chart" ? "📈 Chart" : "📋 Log"}
                </button>
              ))}
            </div>

            {/* Metric selector (chart tab only) */}
            {activeTab === "chart" && (
              <div className="flex flex-wrap gap-1">
                {(Object.keys(METRIC_LABELS) as MetricKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setActiveMetric(k)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${activeMetric === k ? "text-white shadow-sm" : "text-[var(--color-text-muted)] bg-white/[0.03] hover:bg-white/[0.06]"}`}
                    style={activeMetric === k ? { background: METRIC_COLORS[k] } : {}}
                  >
                    {METRIC_LABELS[k]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chart view */}
          {activeTab === "chart" && (
            <div className="p-5">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-subtle)]">
                {METRIC_LABELS[activeMetric]} · weekly
              </p>
              <PerformanceChart entries={entries} metric={activeMetric} />
            </div>
          )}

          {/* Table / log view */}
          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Week of</th>
                    <th className="px-4 py-3 font-semibold text-right">Impressions</th>
                    <th className="px-4 py-3 font-semibold text-right">Clicks</th>
                    <th className="px-4 py-3 font-semibold text-right">CTR</th>
                    <th className="px-4 py-3 font-semibold text-right">Conv.</th>
                    <th className="px-4 py-3 font-semibold text-right">CVR</th>
                    <th className="px-4 py-3 font-semibold text-right">Spend</th>
                    <th className="px-4 py-3 font-semibold text-right">CPA</th>
                    <th className="px-4 py-3 font-semibold text-right">WoW</th>
                    <th className="px-4 py-3 font-semibold">Notes</th>
                    <th className="px-4 py-3 font-semibold">Logged by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {[...entries].reverse().map((e, idx) => {
                    const prevEntry = [...entries].reverse()[idx + 1];
                    const rowCtr = pct(e.clicks, e.impressions);
                    const rowCvr = pct(e.conversions, e.clicks);
                    const rowCpa = e.conversions ? e.spentCents / e.conversions : 0;
                    const rowDelta = prevEntry ? delta(e.conversions, prevEntry.conversions) : null;
                    const anom = anomalies.get(e.id);
                    return (
                      <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-medium text-[var(--color-text)]">{weekLabel(e.weekOf)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCompact(e.impressions)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatCompact(e.clicks)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-violet-300">{formatPercent(rowCtr, 2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">
                          <span className="inline-flex items-center justify-end gap-1">
                            {anom && (
                              <span
                                title={`${anom.direction === "spike" ? "Unusual spike" : "Unusual drop"} vs recent weeks (${anom.deviationPct >= 0 ? "+" : ""}${formatPercent(anom.deviationPct, 0)})`}
                                className={`rounded px-1 text-[9px] font-semibold uppercase ring-1 ring-inset ${anom.direction === "spike" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" : "bg-rose-500/15 text-rose-300 ring-rose-500/30"}`}
                              >
                                {anom.direction === "spike" ? "▲" : "▼"} anom
                              </span>
                            )}
                            {formatNumber(e.conversions)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-xs text-emerald-300">{formatPercent(rowCvr, 2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{formatMoney(e.spentCents)}</td>
                        <td className="px-4 py-3 text-right font-mono text-xs">{rowCpa ? formatMoney(rowCpa) : "—"}</td>
                        <td className="px-4 py-3 text-right"><DeltaPill d={rowDelta} /></td>
                        <td className="px-4 py-3 max-w-[220px]">
                          {e.notes ? (
                            <p className="truncate text-xs text-[var(--color-text-muted)]" title={e.notes}>{e.notes}</p>
                          ) : <span className="text-[var(--color-text-subtle)]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--color-text-muted)] whitespace-nowrap">{e.loggedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04]">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[var(--color-text-subtle)]" aria-hidden="true">
              <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--color-text)]">No performance data yet</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {canManage ? "Log your first weekly entry to start tracking trends." : "No weekly entries have been logged yet."}
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-4 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Log first entry
            </button>
          )}
        </div>
      )}

      {/* ── Log Entry Modal ── */}
      {showModal && (
        <LogEntryModal
          campaignId={campaign.id}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Icon components ──────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function CursorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 2l11 5-5 2-2 5L3 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function PercentIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrendIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M2 11l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 4h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DollarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M8 2v12M5 5.5A2.5 2.5 0 0 1 8 3h.5A2.5 2.5 0 0 1 11 5.5 2.5 2.5 0 0 1 8.5 8H7A2.5 2.5 0 0 0 7 13h.5A2.5 2.5 0 0 0 11 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}
