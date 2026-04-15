"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface UserDetail {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  isActive: boolean;
  deactivatedAt: string | null;
  jobTitle: string | null;
  company: string | null;
  website: string | null;
  location: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  userRoles: {
    id: string;
    assignedAt: string;
    assignedBy: string | null;
    role: { id: string; name: string; displayName: string };
  }[];
}

interface RoleOption {
  id: string;
  name: string;
  displayName: string;
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [allRoles, setAllRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadUser = useCallback(async () => {
    const res = await fetch(`/api/admin/users/${id}`);
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    }
    setLoading(false);
  }, [id]);

  const loadRoles = useCallback(async () => {
    const res = await fetch("/api/admin/roles");
    if (res.ok) {
      const data = await res.json();
      setAllRoles(data.roles.map((r: { id: string; name: string; displayName: string }) => ({
        id: r.id, name: r.name, displayName: r.displayName,
      })));
    }
  }, []);

  useEffect(() => { loadUser(); loadRoles(); }, [loadUser, loadRoles]);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateUser = async (data: Record<string, unknown>) => {
    setSaving(true);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      showMessage("success", "User updated");
      loadUser();
    } else {
      const err = await res.json();
      showMessage("error", err.error || "Update failed");
    }
  };

  const assignRole = async (roleId: string) => {
    const res = await fetch(`/api/admin/users/${id}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    });
    if (res.ok) {
      showMessage("success", "Role assigned");
      loadUser();
    } else {
      const err = await res.json();
      showMessage("error", err.error || "Failed to assign role");
    }
  };

  const removeRole = async (roleId: string) => {
    const res = await fetch(`/api/admin/users/${id}/roles?roleId=${roleId}`, { method: "DELETE" });
    if (res.ok) {
      showMessage("success", "Role removed");
      loadUser();
    } else {
      const err = await res.json();
      showMessage("error", err.error || "Failed to remove role");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded bg-white/10" />
        <div className="h-64 rounded-lg bg-white/5" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-red-400">User not found</div>;
  }

  const assignedRoleIds = new Set(user.userRoles.map((ur) => ur.role.id));
  const availableRoles = allRoles.filter((r) => !assignedRoleIds.has(r.id));

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/users" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">← Users</Link>
        <span className="text-white/20">|</span>
        <h2 className="text-xl font-bold text-[var(--color-text)]">{user.name || user.email}</h2>
        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${user.isActive ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>
          {user.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-md px-4 py-2 text-sm ${message.type === "success" ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-red-400/10 text-red-400 border border-red-400/20"}`}>
          {message.text}
        </div>
      )}

      {/* Info card */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">User Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Username" value={user.username ? `@${user.username}` : "—"} />
          <InfoRow label="Email Verified" value={user.emailVerified ? new Date(user.emailVerified).toLocaleDateString() : "Not verified"} />
          <InfoRow label="Job Title" value={user.jobTitle || "—"} />
          <InfoRow label="Company" value={user.company || "—"} />
          <InfoRow label="Location" value={user.location || "—"} />
          <InfoRow label="Website" value={user.website || "—"} />
          <InfoRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>
        {user.bio && (
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">Bio</p>
            <p className="text-sm text-[var(--color-text)]">{user.bio}</p>
          </div>
        )}
      </div>

      {/* Roles */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Roles</h3>
        <div className="flex flex-wrap gap-2">
          {user.userRoles.map((ur) => (
            <div key={ur.id} className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5">
              <span className="text-sm text-[var(--color-text)]">{ur.role.displayName}</span>
              <button
                onClick={() => removeRole(ur.role.id)}
                className="ml-1 text-[var(--color-text-muted)] hover:text-red-400 transition-colors text-xs"
                title="Remove role"
              >
                ×
              </button>
            </div>
          ))}
          {user.userRoles.length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">No roles assigned</p>
          )}
        </div>
        {availableRoles.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              id="add-role"
              className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
              defaultValue=""
              onChange={(e) => { if (e.target.value) { assignRole(e.target.value); e.target.value = ""; } }}
            >
              <option value="" disabled>Add role...</option>
              {availableRoles.map((r) => (
                <option key={r.id} value={r.id}>{r.displayName}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => updateUser({ isActive: !user.isActive })}
            disabled={saving}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              user.isActive
                ? "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20"
                : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20"
            }`}
          >
            {user.isActive ? "Deactivate User" : "Activate User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-[var(--color-text-muted)] mb-0.5">{label}</p>
      <p className="text-[var(--color-text)]">{value}</p>
    </div>
  );
}
