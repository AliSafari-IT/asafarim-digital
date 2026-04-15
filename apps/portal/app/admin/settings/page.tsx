"use client";

import { useEffect, useState, useCallback } from "react";

interface Setting {
  id: string;
  key: string;
  value: unknown;
  group: string;
  displayName: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    if (res.ok) setSettings((await res.json()).settings);
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveSetting = async (key: string, value: string) => {
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      showMsg("success", "Setting updated");
      setEditingKey(null);
      loadSettings();
    } else {
      showMsg("error", "Failed to update setting");
    }
  };

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-lg bg-white/5" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Site Settings</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">{settings.length} settings configured</p>
      </div>

      {message && (
        <div className={`rounded-md px-4 py-2 text-sm ${message.type === "success" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
          {message.text}
        </div>
      )}

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--color-text)] capitalize">{group}</h3>
          <div className="space-y-3">
            {items.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-[var(--color-text)]">{s.displayName || s.key}</span>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">{s.key}</span>
                  </div>
                  {s.description && <p className="text-xs text-[var(--color-text-muted)] mb-1">{s.description}</p>}
                  {editingKey === s.key ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveSetting(s.key, editValue);
                          if (e.key === "Escape") setEditingKey(null);
                        }}
                      />
                      <button
                        onClick={() => saveSetting(s.key, editValue)}
                        className="rounded px-3 py-1.5 text-xs bg-[var(--color-accent)] text-white hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="rounded px-3 py-1.5 text-xs border border-white/10 text-[var(--color-text-muted)] hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--color-text-muted)] break-all">
                      {typeof s.value === "string" ? s.value : JSON.stringify(s.value)}
                    </p>
                  )}
                </div>
                {editingKey !== s.key && (
                  <button
                    onClick={() => { setEditingKey(s.key); setEditValue(typeof s.value === "string" ? s.value : JSON.stringify(s.value)); }}
                    className="rounded px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors shrink-0"
                  >
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
