"use client";

import { useEffect, useState, useCallback } from "react";

interface Permission {
  id: string;
  name: string;
  displayName: string;
  group: string;
}

interface RoleData {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  isDefault: boolean;
  _count: { userRoles: number; rolePermissions: number };
  rolePermissions: { permission: Permission }[];
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      fetch("/api/admin/roles"),
      fetch("/api/admin/permissions"),
    ]);
    if (rolesRes.ok) setRoles((await rolesRes.json()).roles);
    if (permsRes.ok) setPermissions((await permsRes.json()).permissions);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Delete this role? Users assigned to it will lose it.")) return;
    const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    if (res.ok) { showMsg("success", "Role deleted"); loadData(); }
    else { const err = await res.json(); showMsg("error", err.error); }
  };

  const permsByGroup = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-lg bg-white/5" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">Role Management</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{roles.length} roles configured</p>
        </div>
        <button
          onClick={() => { setShowCreate(true); setEditingRole(null); }}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          + New Role
        </button>
      </div>

      {message && (
        <div className={`rounded-md px-4 py-2 text-sm ${message.type === "success" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
          {message.text}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <RoleForm
          permissions={permissions}
          permsByGroup={permsByGroup}
          onCancel={() => setShowCreate(false)}
          onSave={async (data) => {
            const res = await fetch("/api/admin/roles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            if (res.ok) { showMsg("success", "Role created"); setShowCreate(false); loadData(); }
            else { const err = await res.json(); showMsg("error", err.error); }
          }}
        />
      )}

      {/* Roles list */}
      <div className="space-y-3">
        {roles.map((role) => (
          <div key={role.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
            {editingRole === role.id ? (
              <RoleForm
                initial={role}
                permissions={permissions}
                permsByGroup={permsByGroup}
                onCancel={() => setEditingRole(null)}
                onSave={async (data) => {
                  const res = await fetch(`/api/admin/roles/${role.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                  });
                  if (res.ok) { showMsg("success", "Role updated"); setEditingRole(null); loadData(); }
                  else { const err = await res.json(); showMsg("error", err.error); }
                }}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">{role.displayName}</h3>
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">{role.name}</span>
                    {role.isSystem && (
                      <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-xs text-amber-400">system</span>
                    )}
                    {role.isDefault && (
                      <span className="rounded bg-blue-400/15 px-1.5 py-0.5 text-xs text-blue-400">default</span>
                    )}
                  </div>
                  {role.description && <p className="text-sm text-[var(--color-text-muted)]">{role.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
                    <span>{role._count.userRoles} user{role._count.userRoles !== 1 ? "s" : ""}</span>
                    <span>{role._count.rolePermissions} permission{role._count.rolePermissions !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {role.rolePermissions.slice(0, 8).map((rp) => (
                      <span key={rp.permission.id} className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                        {rp.permission.name}
                      </span>
                    ))}
                    {role.rolePermissions.length > 8 && (
                      <span className="text-xs text-[var(--color-text-muted)]">+{role.rolePermissions.length - 8} more</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingRole(role.id)}
                    className="rounded px-2.5 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                  >
                    Edit
                  </button>
                  {!role.isSystem && (
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleForm({
  initial,
  permissions,
  permsByGroup,
  onCancel,
  onSave,
}: {
  initial?: RoleData;
  permissions: Permission[];
  permsByGroup: Record<string, Permission[]>;
  onCancel: () => void;
  onSave: (data: { name?: string; displayName: string; description: string; isDefault: boolean; permissionIds: string[] }) => Promise<void>;
}) {
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    new Set(initial?.rolePermissions.map((rp) => rp.permission.id) ?? [])
  );
  const [saving, setSaving] = useState(false);

  const togglePerm = (id: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleGroup = (group: string) => {
    const groupPerms = permsByGroup[group] ?? [];
    const allSelected = groupPerms.every((p) => selectedPerms.has(p.id));
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      groupPerms.forEach((p) => allSelected ? next.delete(p.id) : next.add(p.id));
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      ...(initial ? {} : { name: name.toLowerCase().replace(/[^a-z0-9_]/g, "_") }),
      displayName,
      description,
      isDefault,
      permissionIds: Array.from(selectedPerms),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {!initial && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Slug</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
              placeholder="custom_role"
            />
          </div>
        )}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Display Name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
        <div className={initial ? "col-span-2" : ""}>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
        <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
        Default role for new users
      </label>

      {/* Permissions grid */}
      <div>
        <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Permissions ({selectedPerms.size} selected)</p>
        <div className="space-y-3 max-h-64 overflow-y-auto rounded border border-white/10 p-3">
          {Object.entries(permsByGroup).map(([group, perms]) => {
            const allSelected = perms.every((p) => selectedPerms.has(p.id));
            return (
              <div key={group}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide mb-1"
                >
                  <span className={`h-3 w-3 rounded border ${allSelected ? "bg-[var(--color-accent)] border-[var(--color-accent)]" : "border-white/20"}`} />
                  {group}
                </button>
                <div className="grid grid-cols-2 gap-1 ml-5">
                  {perms.map((p) => (
                    <label key={p.id} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text)]">
                      <input
                        type="checkbox"
                        checked={selectedPerms.has(p.id)}
                        onChange={() => togglePerm(p.id)}
                        className="rounded"
                      />
                      {p.displayName}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving..." : initial ? "Update Role" : "Create Role"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-white/10 px-4 py-2 text-sm text-[var(--color-text-muted)] hover:bg-white/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
