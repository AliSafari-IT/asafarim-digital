"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { chatsApi, type ChatSession, type ChatMessage } from "@/lib/client/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  const hrs  = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 30) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function readTime(words: number) {
  return Math.max(1, Math.round(words / 200));
}

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blog:       { bg: "rgba(76,125,255,0.12)",   text: "#6aa3ff", border: "rgba(76,125,255,0.25)"  },
  email:      { bg: "rgba(192,132,252,0.12)",   text: "#c084fc", border: "rgba(192,132,252,0.25)" },
  social:     { bg: "rgba(244,114,182,0.12)",   text: "#f472b6", border: "rgba(244,114,182,0.25)" },
  product:    { bg: "rgba(93,228,199,0.12)",    text: "#5de4c7", border: "rgba(93,228,199,0.25)"  },
  summary:    { bg: "rgba(251,191,36,0.12)",    text: "#fbbf24", border: "rgba(251,191,36,0.25)"  },
  landing:    { bg: "rgba(251,146,60,0.12)",    text: "#fb923c", border: "rgba(251,146,60,0.25)"  },
};

function typeStyle(slug: string | null) {
  return TYPE_COLORS[slug ?? ""] ?? { bg: "rgba(129,149,181,0.08)", text: "#9fb0cf", border: "rgba(129,149,181,0.15)" };
}

// ─── Session card ─────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: ChatSession;
  onDelete: (id: string) => void;
}

function SessionCard({ session, onDelete }: SessionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const style = typeStyle(session.contentType);
  const assistantMsg = messages.find((m) => m.role === "assistant");
  const words = assistantMsg ? wordCount(assistantMsg.content) : 0;

  async function toggleExpand() {
    if (!expanded && messages.length === 0) {
      setLoadingMsgs(true);
      try {
        const { messages: msgs } = await chatsApi.messages(session.id);
        setMessages(msgs);
      } catch { /* ignore */ }
      finally { setLoadingMsgs(false); }
    }
    setExpanded((v) => !v);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${session.title}"?`)) return;
    setDeleting(true);
    try {
      await chatsApi.remove(session.id);
      onDelete(session.id);
    } catch { setDeleting(false); }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    if (assistantMsg) await navigator.clipboard.writeText(assistantMsg.content);
  }

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-[var(--color-surface-elevated)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.5)]"
      style={{ borderColor: expanded ? style.border : "var(--color-border)" }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: style.text, opacity: 0.6 }} />

      {/* Card header — always visible */}
      <button
        type="button"
        onClick={toggleExpand}
        className="flex flex-col gap-3 px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {session.contentType && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
                style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
              >
                {session.contentType}
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${
              session.status === "active"
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : "bg-white/[0.04] text-[var(--color-text-muted)] border-[var(--color-border)]"
            }`}>
              {session.status}
            </span>
          </div>
          <span className="shrink-0 text-[11px] text-[var(--color-text-muted)]">
            {formatRelDate(session.lastMessageAt ?? session.createdAt)}
          </span>
        </div>

        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--color-text)] leading-snug">
          {session.title}
        </h3>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
            {words > 0 && (
              <>
                <span>{words.toLocaleString()} words</span>
                <span>·</span>
                <span>~{readTime(words)} min</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)] transition group-hover:text-[var(--color-primary)]">
            {expanded ? "↑ collapse" : "↓ expand"}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] px-5 py-4">
          {loadingMsgs ? (
            <div className="flex justify-center py-6">
              <svg className="h-5 w-5 animate-spin text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40" strokeDashoffset="20" />
              </svg>
            </div>
          ) : assistantMsg ? (
            <>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-xs leading-relaxed text-[var(--color-text)]">
                {assistantMsg.content}
              </pre>
              {assistantMsg.provider && (
                <p className="mt-2 text-[10px] text-[var(--color-text-muted)]">
                  via <span className="font-semibold">{assistantMsg.provider}</span>
                  {assistantMsg.model && ` · ${assistantMsg.model}`}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
                >
                  Copy text
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([assistantMsg.content], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url; a.download = `${session.title.slice(0, 40)}.md`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-text)]"
                >
                  ↓ .md
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="ml-auto rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-medium text-rose-400 transition hover:bg-rose-500/15 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              </div>
            </>
          ) : (
            <p className="py-4 text-center text-sm text-[var(--color-text-muted)]">No generated content found.</p>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Main Library component ───────────────────────────────────────────────────

const CONTENT_TYPES = ["all", "blog", "email", "social", "product", "summary", "landing"];

export function DraftLibrary() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { sessions: all } = await chatsApi.list({ includeArchived: false });
      setSessions(all.sort((a, b) => {
        const da = a.lastMessageAt ?? a.createdAt;
        const db = b.lastMessageAt ?? b.createdAt;
        return db.localeCompare(da);
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load drafts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleDelete = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const filtered = sessions.filter((s) => {
    const matchType = filter === "all" || s.contentType === filter;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const counts = sessions.reduce<Record<string, number>>((acc, s) => {
    const k = s.contentType ?? "other";
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Content</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Draft Library</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {sessions.length} session{sessions.length !== 1 ? "s" : ""} · click any card to preview &amp; export
          </p>
        </div>
        <Link
          href="/#generator"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(76,125,255,0.7)] transition hover:opacity-90"
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          New draft
        </Link>
      </div>

      {/* Filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <svg viewBox="0 0 16 16" fill="none" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--color-text-secondary)]" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M14 14l-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search drafts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] pl-9 pr-4 text-sm text-[var(--color-text)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-1.5">
          {CONTENT_TYPES.map((t) => {
            const cnt = t === "all" ? sessions.length : (counts[t] ?? 0);
            const style = typeStyle(t === "all" ? null : t);
            const active = filter === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setFilter(t)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-all"
                style={active
                  ? { background: style.bg, color: style.text, border: `1px solid ${style.border}` }
                  : { background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }
                }
              >
                {t}
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 font-mono text-[9px]">{cnt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-6 py-8 text-center">
          <p className="text-sm text-rose-400">{error}</p>
          <button type="button" onClick={load} className="mt-3 text-xs font-semibold text-[var(--color-primary)] hover:underline">
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-surface-elevated)]">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-[var(--color-text-secondary)]" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="font-medium text-[var(--color-text)]">
            {search ? "No drafts match your search" : "No drafts yet"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {search ? "Try a different search term or filter." : "Generate your first piece of content to get started."}
          </p>
          {!search && (
            <Link href="/#generator"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">
              Start generating
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <SessionCard key={s.id} session={s} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
