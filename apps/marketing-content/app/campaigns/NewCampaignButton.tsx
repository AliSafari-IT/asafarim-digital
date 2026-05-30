"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { createCampaign } from "./actions";

const CHANNELS = ["seo", "email", "paid", "social", "partner"] as const;
const STATUSES = ["scheduled", "live", "paused", "ended"] as const;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

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

export function NewCampaignButton() {
  const router = useRouter();
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    channel: "paid",
    status: "scheduled",
    budgetDollars: "",
    startedAt: todayIso(),
    owner: "",
  });

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  function close() {
    setOpen(false);
    setErrors({});
    setFormError(null);
    setForm({ name: "", channel: "paid", status: "scheduled", budgetDollars: "", startedAt: todayIso(), owner: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    const res = await createCampaign({
      name: form.name,
      channel: form.channel,
      status: form.status,
      budgetDollars: form.budgetDollars,
      startedAt: form.startedAt,
      owner: form.owner,
    });
    setSaving(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      setFormError(res.error);
      return;
    }
    close();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:brightness-110"
      >
        + New campaign
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
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
            `}</style>

            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">Campaign</p>
                <h2 id={`${uid}-title`} className="text-base font-semibold text-[var(--color-text)]">New Campaign</h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-[var(--color-text)] transition-colors"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
              <div className="flex-1 space-y-5 px-6 py-5">
                {formError && (
                  <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
                    {formError}
                  </div>
                )}

                <Field label="Campaign name" id={`${uid}-name`} error={errors.name}>
                  <input id={`${uid}-name`} type="text" placeholder="e.g. Q3 Growth — Ops Hub"
                    value={form.name} onChange={set("name")} className={inputCls(!!errors.name)} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Channel" id={`${uid}-channel`} error={errors.channel}>
                    <select id={`${uid}-channel`} value={form.channel} onChange={set("channel")} className={inputCls(!!errors.channel)}>
                      {CHANNELS.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </Field>
                  <Field label="Status" id={`${uid}-status`} error={errors.status}>
                    <select id={`${uid}-status`} value={form.status} onChange={set("status")} className={inputCls(!!errors.status)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Budget (USD)" id={`${uid}-budget`} error={errors.budgetDollars}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)] text-sm">$</span>
                      <input id={`${uid}-budget`} type="number" min="0" step="0.01" placeholder="0.00"
                        value={form.budgetDollars} onChange={set("budgetDollars")} className={`${inputCls(!!errors.budgetDollars)} pl-7`} />
                    </div>
                  </Field>
                  <Field label="Start date" id={`${uid}-start`} error={errors.startedAt}>
                    <input id={`${uid}-start`} type="date" max={todayIso()}
                      value={form.startedAt} onChange={set("startedAt")} className={inputCls(!!errors.startedAt)} />
                  </Field>
                </div>

                <Field label="Owner (optional)" id={`${uid}-owner`}>
                  <input id={`${uid}-owner`} type="text" placeholder="Defaults to your name"
                    value={form.owner} onChange={set("owner")} className={inputCls(false)} />
                </Field>
              </div>

              <div className="border-t border-[var(--color-border)] px-6 py-4 flex gap-3">
                <button type="button" onClick={close}
                  className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60">
                  {saving ? "Creating…" : "Create Campaign"}
                </button>
              </div>
            </form>
          </aside>
        </>
      )}
    </>
  );
}
