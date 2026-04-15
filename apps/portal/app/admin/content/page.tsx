"use client";

import { useEffect, useState, useCallback } from "react";

interface ContentSection {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  eyebrow: string | null;
  body: unknown;
  metadata: unknown;
  position: number;
  isPublished: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadContent = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/content");
    if (res.ok) setContent((await res.json()).content);
    setLoading(false);
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const togglePublish = async (id: string, isPublished: boolean) => {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !isPublished }),
    });
    if (res.ok) { showMsg("success", isPublished ? "Unpublished" : "Published"); loadContent(); }
    else showMsg("error", "Failed to toggle publish state");
  };

  const deleteContent = async (id: string) => {
    if (!confirm("Delete this content section?")) return;
    const res = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
    if (res.ok) { showMsg("success", "Content deleted"); loadContent(); }
    else showMsg("error", "Failed to delete");
  };

  const saveContent = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/content/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { showMsg("success", "Content updated"); setEditingId(null); loadContent(); }
    else showMsg("error", "Failed to update");
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-white/5" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Content Management</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{content.length} sections</p>
      </div>

      {message && (
        <div className={`rounded-md px-4 py-2 text-sm ${message.type === "success" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-3">
        {content.map((c) => (
          <div key={c.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
            {editingId === c.id ? (
              <ContentEditForm
                content={c}
                onCancel={() => setEditingId(null)}
                onSave={(data) => saveContent(c.id, data)}
              />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-[var(--color-text-muted)]">
                      {c.section}
                    </span>
                    <span className={`text-xs font-medium ${c.isPublished ? "text-emerald-400" : "text-amber-400"}`}>
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">pos: {c.position}</span>
                  </div>
                  {c.title && <p className="text-sm font-medium text-[var(--color-text)] truncate">{c.title}</p>}
                  {c.eyebrow && <p className="text-xs text-[var(--color-accent)]">{c.eyebrow}</p>}
                  {c.subtitle && <p className="text-xs text-[var(--color-text-muted)] truncate">{c.subtitle}</p>}
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Updated: {new Date(c.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setEditingId(c.id)}
                    className="rounded px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => togglePublish(c.id, c.isPublished)}
                    className="rounded px-2.5 py-1 text-xs text-amber-400 hover:bg-amber-400/10 transition-colors"
                  >
                    {c.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => deleteContent(c.id)}
                    className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentEditForm({
  content,
  onCancel,
  onSave,
}: {
  content: ContentSection;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [title, setTitle] = useState(content.title ?? "");
  const [subtitle, setSubtitle] = useState(content.subtitle ?? "");
  const [eyebrow, setEyebrow] = useState(content.eyebrow ?? "");
  const [position, setPosition] = useState(content.position);
  const [bodyJson, setBodyJson] = useState(content.body ? JSON.stringify(content.body, null, 2) : "");
  const [metadataJson, setMetadataJson] = useState(content.metadata ? JSON.stringify(content.metadata, null, 2) : "");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJsonError(null);

    let body = null;
    let metadata = null;

    try {
      if (bodyJson.trim()) body = JSON.parse(bodyJson);
    } catch { setJsonError("Invalid body JSON"); return; }

    try {
      if (metadataJson.trim()) metadata = JSON.parse(metadataJson);
    } catch { setJsonError("Invalid metadata JSON"); return; }

    onSave({
      title: title.trim() || null,
      subtitle: subtitle.trim() || null,
      eyebrow: eyebrow.trim() || null,
      body,
      metadata,
      position,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-[var(--color-text-muted)]">{content.section}</span>
        <span className="text-xs text-[var(--color-text-muted)]">Editing</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Eyebrow</label>
          <input value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Position</label>
          <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Subtitle</label>
        <textarea value={subtitle} onChange={(e) => setSubtitle(e.target.value)} rows={2} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none resize-y" />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Body (JSON)</label>
        <textarea value={bodyJson} onChange={(e) => setBodyJson(e.target.value)} rows={6} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none resize-y" />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Metadata (JSON)</label>
        <textarea value={metadataJson} onChange={(e) => setMetadataJson(e.target.value)} rows={4} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none resize-y" />
      </div>

      {jsonError && <p className="text-xs text-red-400">{jsonError}</p>}

      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-white/10 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-white/5 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
