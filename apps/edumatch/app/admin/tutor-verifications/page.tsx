"use client";

import { useEffect, useState, useCallback } from "react";

type Review = {
  id: string;
  status: string;
  checklist: Record<string, unknown> | null;
  adminNotes: string | null;
  tutorMessage: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

type TutorRow = {
  tutorId: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  subjectsTaught: string[];
  verifiedAt: string | null;
  latestReview: Review | null;
  effectiveStatus: string;
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-500/15 text-yellow-400",
  NEEDS_CHANGES: "bg-orange-500/15 text-orange-400",
  VERIFIED: "bg-green-500/15 text-green-400",
  REJECTED: "bg-red-500/15 text-red-400",
};

export default function AdminTutorVerificationsPage() {
  const [rows, setRows] = useState<TutorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "VERIFIED">("OPEN");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tutor-verifications");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { tutors: TutorRow[] };
      setRows(data.tutors);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function setStatus(
    tutorId: string,
    status: string,
    extra: { tutorMessage?: string; adminNotes?: string } = {},
  ) {
    setBusyId(tutorId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tutor-verifications/${tutorId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = rows.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "VERIFIED") return r.effectiveStatus === "VERIFIED";
    return r.effectiveStatus !== "VERIFIED" && r.effectiveStatus !== "REJECTED";
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Tutor Verifications
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Review tutor profiles and approve, reject, or request changes.
          </p>
        </div>
        <div className="flex gap-2">
          {(["OPEN", "VERIFIED", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium border transition-colors ${
                filter === f
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-panel)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No tutors in this view.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <TutorRowCard
              key={r.tutorId}
              row={r}
              busy={busyId === r.tutorId}
              onSetStatus={setStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TutorRowCard({
  row,
  busy,
  onSetStatus,
}: {
  row: TutorRow;
  busy: boolean;
  onSetStatus: (
    tutorId: string,
    status: string,
    extra?: { tutorMessage?: string; adminNotes?: string },
  ) => Promise<void>;
}) {
  const [needsMsg, setNeedsMsg] = useState("");
  const [adminNotes, setAdminNotes] = useState(
    row.latestReview?.adminNotes ?? "",
  );

  const badge =
    STATUS_BADGE[row.effectiveStatus] ?? "bg-[var(--color-surface)] text-[var(--color-text-muted)]";

  return (
    <div
      data-testid="tutor-verification-row"
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[var(--color-text)] truncate">
              {row.name ?? row.email ?? row.tutorId}
            </h2>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}
            >
              {row.effectiveStatus}
            </span>
            {row.verifiedAt ? (
              <span className="text-xs text-[var(--color-text-muted)]">
                · verified{" "}
                {new Date(row.verifiedAt).toLocaleDateString()}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">{row.email}</p>
          <p className="mt-2 text-sm text-[var(--color-text)] opacity-80 line-clamp-3 whitespace-pre-wrap">
            {row.bio ?? "(no bio)"}
          </p>
          {row.subjectsTaught.length > 0 && (
            <p className="mt-2 text-xs text-[var(--color-text-muted)]">
              Subjects: {row.subjectsTaught.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)]">
            Admin notes (internal)
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
            placeholder="Internal notes (not shown to tutor)"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)]">
            Message to tutor (used with "Needs changes")
          </label>
          <textarea
            value={needsMsg}
            onChange={(e) => setNeedsMsg(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
            placeholder="What does the tutor need to fix?"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          data-testid="verify-tutor"
          disabled={busy}
          onClick={() =>
            onSetStatus(row.tutorId, "VERIFIED", { adminNotes })
          }
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {busy ? "Working..." : "Verify"}
        </button>
        <button
          disabled={busy || !needsMsg.trim()}
          onClick={() =>
            onSetStatus(row.tutorId, "NEEDS_CHANGES", {
              tutorMessage: needsMsg,
              adminNotes,
            })
          }
          className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
        >
          Needs changes
        </button>
        <button
          data-testid="reject-tutor"
          disabled={busy}
          onClick={() =>
            onSetStatus(row.tutorId, "REJECTED", { adminNotes })
          }
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
