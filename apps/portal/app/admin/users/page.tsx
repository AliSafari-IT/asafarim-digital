"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface UserRow {
  id: string;
  name: string | null;
  username: string | null;
  email: string;
  emailVerified: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userRoles: { role: { id: string; name: string; displayName: string } }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pagination.page), limit: "20" });
    if (search) params.set("search", search);
    if (filter === "active") params.set("isActive", "true");
    if (filter === "inactive") params.set("isActive", "false");

    const res = await fetch(`/api/admin/users?${params}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, [pagination.page, search, filter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const toggleActive = async (userId: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)]">User Management</h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{pagination.total} users total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or username..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none w-80"
        />
        <div className="flex rounded-md border border-white/10 overflow-hidden">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPagination((p) => ({ ...p, page: 1 })); }}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                  : "text-[var(--color-text-muted)] hover:bg-white/5"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">User</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Email</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Roles</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Status</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-muted)]">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-muted)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={6} className="px-4 py-3"><div className="h-4 w-full rounded bg-white/5 animate-pulse" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No users found</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {u.image ? (
                          <img src={u.image} alt="" className="h-7 w-7 rounded-full" />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center text-xs font-medium text-[var(--color-accent)]">
                            {(u.name || u.email)[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-[var(--color-text)]">{u.name || "—"}</p>
                          {u.username && <p className="text-xs text-[var(--color-text-muted)]">@{u.username}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {u.email}
                      {u.emailVerified && <span className="ml-1 text-emerald-400 text-xs" title="Verified">✓</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.userRoles.map((ur) => (
                          <span key={ur.role.id} className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                            {ur.role.displayName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.isActive ? "text-emerald-400" : "text-red-400"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="rounded px-2 py-1 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => toggleActive(u.id, u.isActive)}
                          className={`rounded px-2 py-1 text-xs transition-colors ${
                            u.isActive
                              ? "text-red-400 hover:bg-red-400/10"
                              : "text-emerald-400 hover:bg-emerald-400/10"
                          }`}
                        >
                          {u.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <p className="text-xs text-[var(--color-text-muted)]">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="rounded px-3 py-1 text-xs border border-white/10 text-[var(--color-text-muted)] hover:bg-white/5 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="rounded px-3 py-1 text-xs border border-white/10 text-[var(--color-text-muted)] hover:bg-white/5 disabled:opacity-30"
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
