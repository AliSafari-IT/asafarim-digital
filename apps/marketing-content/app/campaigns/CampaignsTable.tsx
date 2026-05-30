"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CampaignView } from "@/lib/campaigns";
import { StatusBadge } from "@/components/StatusBadge";
import { KpiCard } from "@/components/KpiCard";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { CampaignForm } from "./CampaignForm";
import { setCampaignStatus, deleteCampaign } from "./actions";

const CHANNELS = ["seo", "email", "paid", "social", "partner"] as const;
const STATUSES = ["live", "scheduled", "paused", "ended"] as const;

// "created" is the default sentinel — it preserves the server's createdAt order
// (the familiar c1..c8 showcase order) and is never exposed as a column header.
export type SortKey =
  | "created" | "name" | "channel" | "status" | "owner"
  | "budget" | "spent" | "conversions" | "cpa" | "progress" | "started" | "entries";
export type SortDir = "asc" | "desc";

const cpaOf = (c: CampaignView) => (c.conversions ? c.spentCents / c.conversions : 0);
const progressOf = (c: CampaignView) =>
  c.budgetCents ? Math.min(1, c.spentCents / c.budgetCents) : 0;

function sortValue(c: CampaignView, key: SortKey): number | string {
  switch (key) {
    case "created": return 0; // stable sort preserves incoming order
    case "name": return c.name.toLowerCase();
    case "channel": return c.channel;
    case "status": return c.status;
    case "owner": return c.owner.toLowerCase();
    case "budget": return c.budgetCents;
    case "spent": return c.spentCents;
    case "conversions": return c.conversions;
    case "cpa": return cpaOf(c);
    case "progress": return progressOf(c);
    case "started": return c.startedAt;
    case "entries": return c.entryCount;
  }
}

export interface CampaignsTableProps {
  campaigns: CampaignView[];
  initialChannel: string;
  initialStatus: string;
  initialQuery: string;
  initialSort: SortKey;
  initialDir: SortDir;
}

export function CampaignsTable({
  campaigns,
  initialChannel,
  initialStatus,
  initialQuery,
  initialSort,
  initialDir,
}: CampaignsTableProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [channel, setChannel] = useState(initialChannel);
  const [status, setStatus] = useState(initialStatus);
  const [query, setQuery] = useState(initialQuery);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const [editing, setEditing] = useState<CampaignView | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Keep the URL in sync so filters are shareable and survive reload. Filtering
  // itself is client-side and instant (see `filtered` below); the URL write is
  // debounced so live typing doesn't trigger a server round-trip per keystroke.
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      if (channel !== "all") params.set("channel", channel);
      if (status !== "all") params.set("status", status);
      if (query.trim()) params.set("q", query.trim());
      if (sortKey !== "created") params.set("sort", sortKey);
      if (sortDir !== "asc") params.set("dir", sortDir);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
  }, [channel, status, query, sortKey, sortDir, pathname, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = campaigns.filter((c) => {
      if (channel !== "all" && c.channel !== channel) return false;
      if (status !== "all" && c.status !== status) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.owner.toLowerCase().includes(q)) return false;
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [campaigns, channel, status, query, sortKey, sortDir]);

  // Filtered KPI roll-ups.
  const totalBudget = filtered.reduce((s, c) => s + c.budgetCents, 0);
  const totalSpent = filtered.reduce((s, c) => s + c.spentCents, 0);
  const totalConversions = filtered.reduce((s, c) => s + c.conversions, 0);
  const totalClicks = filtered.reduce((s, c) => s + c.clicks, 0);
  const cvr = totalClicks ? totalConversions / totalClicks : 0;

  const filtersActive = channel !== "all" || status !== "all" || query.trim() !== "";

  function clearFilters() {
    setChannel("all");
    setStatus("all");
    setQuery("");
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "name" || key === "started" ? "asc" : "desc"); }
  }

  async function onStatusChange(id: string, to: string) {
    setBusyId(id);
    await setCampaignStatus(id, to);
    setBusyId(null);
    router.refresh();
  }

  async function onDelete(id: string) {
    setBusyId(id);
    await deleteCampaign(id);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* KPI cards reflect the filtered subset */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Budget (filtered)" value={formatMoney(totalBudget)} tone="brand" hint={`${filtered.length} campaigns`} />
        <KpiCard label="Spent" value={formatMoney(totalSpent)} hint={totalBudget ? `${formatPercent(totalSpent / totalBudget, 0)} of budget` : "—"} tone="warning" />
        <KpiCard label="Conversions" value={formatNumber(totalConversions)} tone="success" />
        <KpiCard label="Click → conv." value={formatPercent(cvr, 2)} hint={`${formatNumber(totalClicks)} clicks total`} />
      </div>

      {/* Controls: search + channel + status filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg viewBox="0 0 16 16" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-subtle)]" aria-hidden="true">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or owner…"
              aria-label="Search campaigns"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/60 py-2 pl-9 pr-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          </div>
          <span className="text-xs text-[var(--color-text-subtle)]">
            {filtered.length} of {campaigns.length}
          </span>
          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--color-text-subtle)]">Channel:</span>
          <Chip active={channel === "all"} onClick={() => setChannel("all")}>all</Chip>
          {CHANNELS.map((ch) => (
            <Chip key={ch} active={channel === ch} onClick={() => setChannel(ch)}>{ch}</Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--color-text-subtle)]">Status:</span>
          <Chip active={status === "all"} onClick={() => setStatus("all")}>all</Chip>
          {STATUSES.map((s) => (
            <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s}</Chip>
          ))}
        </div>
      </div>

      {/* Table */}
      {campaigns.length === 0 ? (
        <EmptyState title="No campaigns yet" hint="Create your first campaign to start tracking performance." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No campaigns match your filters"
          hint="Try a different channel, status, or search term."
          action={<button type="button" onClick={clearFilters} className="mt-4 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]">Clear filters</button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-soft)]/60 text-[11px] uppercase tracking-wide text-[var(--color-text-subtle)]">
              <tr>
                <SortHeader label="Campaign" col="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3 font-semibold">Channel</th>
                <SortHeader label="Status" col="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3 font-semibold">Owner</th>
                <SortHeader label="Budget" col="budget" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Spent" col="spent" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Conv." col="conversions" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="CPA" col="cpa" align="right" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Progress" col="progress" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <SortHeader label="Entries" col="entries" align="center" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.map((c) => {
                const cpa = cpaOf(c);
                const progressPct = Math.round(progressOf(c) * 100);
                const count = c.entryCount;
                return (
                  <tr key={c.id} className="group hover:bg-white/[0.025] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/campaigns/${c.id}`} className="block">
                        <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">{c.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">Started {c.startedAt}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3"><StatusBadge value={c.channel} /></td>
                    <td className="px-4 py-3"><StatusBadge value={c.status} /></td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.owner}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatMoney(c.budgetCents)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{formatMoney(c.spentCents)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[var(--color-text)]">{formatNumber(c.conversions)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{cpa ? formatMoney(cpa) : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div className={`h-full ${progressPct > 90 ? "bg-rose-500" : progressPct > 60 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${progressPct}%` }} />
                        </div>
                        <span className="w-8 text-right font-mono text-[10px] text-[var(--color-text-subtle)]">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/campaigns/${c.id}`}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${count > 0 ? "bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30 hover:bg-rose-500/25" : "bg-white/[0.04] text-[var(--color-text-subtle)] hover:bg-white/[0.08]"}`}
                      >
                        {count > 0 ? <>{count}w</> : <span>Log →</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.isOwn ? (
                        <RowMenu
                          campaign={c}
                          busy={busyId === c.id}
                          onEdit={() => setEditing(c)}
                          onStatus={(to) => onStatusChange(c.id, to)}
                          onDelete={() => onDelete(c.id)}
                        />
                      ) : (
                        <span className="text-[10px] uppercase tracking-wide text-[var(--color-text-subtle)]" title="Shared demo campaign (read-only)">Demo</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <CampaignForm mode="edit" open={editing !== null} campaign={editing ?? undefined} onClose={() => setEditing(null)} />
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors ${active
        ? "bg-[var(--color-primary-soft)] text-[var(--color-accent)] ring-1 ring-inset ring-[var(--color-accent)]/30"
        : "border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"}`}
    >
      {children}
    </button>
  );
}

function SortHeader({
  label, col, sortKey, sortDir, onSort, align = "left",
}: {
  label: string; col: SortKey; sortKey: SortKey; sortDir: SortDir;
  onSort: (k: SortKey) => void; align?: "left" | "right" | "center";
}) {
  const active = sortKey === col;
  const alignCls = align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <th className={`px-4 py-3 font-semibold ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(col)}
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
        className={`inline-flex items-center gap-1 ${alignCls} uppercase tracking-wide transition-colors hover:text-[var(--color-text)] ${active ? "text-[var(--color-text)]" : ""}`}
      >
        {label}
        <span className="text-[8px] leading-none">{active ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
      </button>
    </th>
  );
}

function EmptyState({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30 py-16 text-center">
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>
      {action}
    </div>
  );
}

function RowMenu({
  campaign, busy, onEdit, onStatus, onDelete,
}: {
  campaign: CampaignView;
  busy: boolean;
  onEdit: () => void;
  onStatus: (to: string) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function close() { setOpen(false); setConfirmDelete(false); }

  const toggle =
    campaign.status === "live" ? { label: "Pause", to: "paused" }
    : campaign.status === "paused" ? { label: "Resume", to: "live" }
    : campaign.status === "scheduled" ? { label: "Activate", to: "live" }
    : { label: "Reactivate", to: "live" };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-label="Campaign actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-white/[0.06] hover:text-[var(--color-text)] disabled:opacity-50"
      >
        {busy ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true"><circle cx="8" cy="3" r="1.4" /><circle cx="8" cy="8" r="1.4" /><circle cx="8" cy="13" r="1.4" /></svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] py-1 text-left shadow-xl"
          >
            <MenuItem onClick={() => { close(); onEdit(); }}>Edit</MenuItem>
            <MenuItem onClick={() => { close(); onStatus(toggle.to); }}>{toggle.label}</MenuItem>
            {campaign.status !== "ended" && (
              <MenuItem onClick={() => { close(); onStatus("ended"); }}>End campaign</MenuItem>
            )}
            <div className="my-1 border-t border-[var(--color-border)]" />
            {confirmDelete ? (
              <div className="px-3 py-2">
                <p className="mb-2 text-[11px] text-[var(--color-text-muted)]">Delete this campaign and its entries?</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { close(); onDelete(); }} className="flex-1 rounded-md bg-rose-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-600">Delete</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Cancel</button>
                </div>
              </div>
            ) : (
              <MenuItem danger onClick={() => setConfirmDelete(true)}>Delete</MenuItem>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`block w-full px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/[0.05] ${danger ? "text-rose-300 hover:text-rose-200" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"}`}
    >
      {children}
    </button>
  );
}
