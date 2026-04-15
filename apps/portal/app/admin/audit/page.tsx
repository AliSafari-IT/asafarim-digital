"use client";

import { useEffect, useState, useCallback } from "react";

const ENTITIES = ["User", "Role", "UserRole", "SiteContent", "NavItem", "SiteSetting"] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getActionBadgeClasses(action: string) {
  const normalized = action.toLowerCase();

  if (normalized.includes("delete") || normalized.includes("remove")) {
    return "border-red-400/30 bg-red-500/10 text-red-200";
  }

  if (normalized.includes("create") || normalized.includes("add")) {
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  }

  if (normalized.includes("update") || normalized.includes("edit")) {
    return "border-sky-400/30 bg-sky-500/10 text-sky-200";
  }

  return "border-white/15 bg-white/5 text-[var(--color-text-muted)]";
}

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  changes: unknown;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 30, total: 0, totalPages: 0 });
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pagination.page), limit: "30" });
    if (entityFilter) params.set("entity", entityFilter);
    if (actionFilter) params.set("action", actionFilter);

    const res = await fetch(`/api/admin/audit?${params}`);
    if (res.ok) {
      const data = await res.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.page, entityFilter, actionFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-[linear-gradient(155deg,rgba(93,228,199,0.08),rgba(76,125,255,0.03)_40%,transparent_80%)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]/90">Compliance</p>
            <h2 className="mt-1 text-3xl font-semibold text-[var(--color-text)]">Audit Log</h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Track changes across users, roles, content, and settings.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-text-muted)]">Total events</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-text)]">{pagination.total}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setEntityFilter(""); setPagination((p) => ({ ...p, page: 1 })); }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              entityFilter === ""
                ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                : "border-white/10 bg-white/[0.02] text-[var(--color-text-muted)] hover:border-white/20 hover:text-[var(--color-text)]"
            }`}
          >
            All entities
          </button>
          {ENTITIES.map((entity) => (
            <button
              key={entity}
              onClick={() => { setEntityFilter(entity); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                entityFilter === entity
                  ? "border-[var(--color-accent)]/50 bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                  : "border-white/10 bg-white/[0.02] text-[var(--color-text-muted)] hover:border-white/20 hover:text-[var(--color-text)]"
              }`}
            >
              {entity}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search action (create, update, delete...)"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)]/70 focus:outline-none"
            />
          </div>
          {actionFilter && (
            <button
              onClick={() => { setActionFilter(""); setPagination((p) => ({ ...p, page: 1 })); }}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] hover:border-white/20 hover:text-[var(--color-text)]"
            >
              Clear action filter
            </button>
          )}
        </div>
      </div>

      {/* Log entries */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="grid grid-cols-[1.6fr,1fr,auto] gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          <span>Activity</span>
          <span>Actor</span>
          <span>Timestamp</span>
        </div>
        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            {[...Array(8)].map((_, i) => <div key={i} className="h-10 rounded bg-white/5" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-[var(--color-text-muted)]">No audit log entries found</div>
        ) : (
          <div>
            {logs.map((log) => (
              <div
                key={log.id}
                className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="grid w-full grid-cols-[1.6fr,1fr,auto] items-center gap-3 px-4 py-3 text-left"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${getActionBadgeClasses(log.action)} shrink-0`}>
                      {log.action}
                    </span>
                    <span className="text-sm font-medium text-[var(--color-text)]">{log.entity}</span>
                    {log.entityId && (
                      <span className="rounded border border-white/10 bg-white/[0.02] px-1.5 py-0.5 text-xs font-mono text-[var(--color-text-muted)]">
                        #{log.entityId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 text-xs text-[var(--color-text-muted)]">
                    <span className="truncate">{log.user?.name || log.user?.email || "System"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] shrink-0">
                    <span>{formatDate(log.createdAt)}</span>
                    <span className="text-[10px]">{expandedId === log.id ? "▼" : "▶"}</span>
                  </div>
                </button>

                {expandedId === log.id && (
                  <div className="mx-4 mb-4 rounded-lg border border-white/10 bg-[var(--color-panel)]/55 p-4">
                    <div className="mb-3 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">User</p>
                        <p className="mt-1 text-[var(--color-text)]">{log.user?.email || "System"}</p>
                      </div>
                      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Time</p>
                        <p className="mt-1 text-[var(--color-text)]">{formatDate(log.createdAt)}</p>
                      </div>
                      {log.ipAddress && (
                        <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                          <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">IP</p>
                          <p className="mt-1 text-[var(--color-text)]">{log.ipAddress}</p>
                        </div>
                      )}
                      <div className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Entity ID</p>
                        <p className="mt-1 font-mono text-[var(--color-text)]">{log.entityId || "—"}</p>
                      </div>
                    </div>
                    {log.changes != null && (
                      <div>
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">Changes</p>
                        <pre className="max-h-72 overflow-x-auto rounded-md border border-white/10 bg-[#070f1a] p-3 text-xs text-[var(--color-text)]">
                          {String(JSON.stringify(log.changes, null, 2))}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:border-white/20 hover:bg-white/5 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="rounded-md border border-white/10 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] hover:border-white/20 hover:bg-white/5 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
