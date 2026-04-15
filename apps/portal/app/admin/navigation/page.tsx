"use client";

import { useEffect, useState, useCallback } from "react";

interface NavItemData {
  id: string;
  label: string;
  href: string;
  position: number;
  visibility: string;
  requiredRole: string | null;
  parentId: string | null;
  isActive: boolean;
  icon: string | null;
  target: string | null;
  group: string;
  children: NavItemData[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminNavigationPage() {
  const [items, setItems] = useState<NavItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/navigation");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items.filter((i: NavItemData) => !i.parentId));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadItems(); }, [loadItems]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this navigation item?")) return;
    const res = await fetch(`/api/admin/navigation/${id}`, { method: "DELETE" });
    if (res.ok) { showMsg("success", "Item deleted"); loadItems(); }
    else showMsg("error", "Failed to delete");
  };

  const saveItem = async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/navigation/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { showMsg("success", "Item updated"); setEditingId(null); loadItems(); }
    else showMsg("error", "Failed to update");
  };

  const createItem = async (data: Record<string, unknown>) => {
    const res = await fetch("/api/admin/navigation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) { showMsg("success", "Item created"); setShowCreate(false); loadItems(); }
    else { const err = await res.json(); showMsg("error", err.error || "Failed to create"); }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-white/5" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Navigation Management</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{items.length} top-level items</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null); }}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + New Item
        </button>
      </div>

      {message && (
        <div className={`rounded-md px-4 py-2 text-sm ${message.type === "success" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
          {message.text}
        </div>
      )}

      {showCreate && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
          <NavItemForm
            onCancel={() => setShowCreate(false)}
            onSave={createItem}
          />
        </div>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            {editingId === item.id ? (
              <NavItemForm
                initial={item}
                onCancel={() => setEditingId(null)}
                onSave={(data) => saveItem(item.id, data)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--color-text-muted)] w-6">{item.position}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-text)]">{item.label}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{item.href}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs ${item.isActive ? "text-emerald-400" : "text-red-400"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">{item.visibility}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{item.group}</span>
                      {item.requiredRole && (
                        <span className="rounded bg-amber-400/15 px-1 py-0.5 text-xs text-amber-400">
                          {item.requiredRole}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingId(item.id)} className="rounded px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            )}

            {/* Children */}
            {item.children?.length > 0 && (
              <div className="ml-8 mt-2 space-y-1 border-l border-white/10 pl-3">
                {item.children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[var(--color-text-muted)]">{child.position}</span>
                      <span className="text-sm text-[var(--color-text)]">{child.label}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">{child.href}</span>
                    </div>
                    <button onClick={() => deleteItem(child.id)} className="rounded px-2 py-0.5 text-xs text-red-400 hover:bg-red-400/10">
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavItemForm({
  initial,
  onCancel,
  onSave,
}: {
  initial?: NavItemData;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [href, setHref] = useState(initial?.href ?? "");
  const [position, setPosition] = useState(initial?.position ?? 0);
  const [visibility, setVisibility] = useState(initial?.visibility ?? "public");
  const [requiredRole, setRequiredRole] = useState(initial?.requiredRole ?? "");
  const [group, setGroup] = useState(initial?.group ?? "main");
  const [target, setTarget] = useState(initial?.target ?? "_self");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      label: label.trim(),
      href: href.trim(),
      position,
      visibility,
      requiredRole: requiredRole.trim() || null,
      group,
      target,
      isActive,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} required className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">URL / Href</label>
          <input value={href} onChange={(e) => setHref(e.target.value)} required className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Position</label>
          <input type="number" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none">
            <option value="public">Public</option>
            <option value="authenticated">Authenticated</option>
            <option value="role">Role-based</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Required Role</label>
          <input value={requiredRole} onChange={(e) => setRequiredRole(e.target.value)} placeholder="e.g. admin" className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Group</label>
          <input value={group} onChange={(e) => setGroup(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Target</label>
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none">
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded" />
        Active
      </label>

      <div className="flex gap-2">
        <button type="submit" className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
          {initial ? "Update" : "Create"} Item
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-white/10 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-white/5 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
