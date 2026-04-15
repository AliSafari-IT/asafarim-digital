"use client";

import { useEffect, useState } from "react";

interface DashboardData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    contentSections: number;
    publishedContent: number;
    navItems: number;
    settingsCount: number;
  };
  roleDistribution: { roleName: string; displayName: string; userCount: number }[];
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    isActive: boolean;
    createdAt: string;
    userRoles: { role: { name: string; displayName: string } }[];
  }[];
  recentAuditLogs: {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    createdAt: string;
    user: { name: string | null; email: string } | null;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load dashboard");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="text-red-400 p-4">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h2>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">System overview and recent activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={data.stats.totalUsers} accent />
        <StatCard label="Active Users" value={data.stats.activeUsers} />
        <StatCard label="Content Sections" value={data.stats.contentSections} />
        <StatCard label="Published Content" value={data.stats.publishedContent} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Role Distribution */}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Role Distribution</h3>
          <div className="space-y-3">
            {data.roleDistribution.map((r) => (
              <div key={r.roleName} className="flex items-center justify-between">
                <span className="text-sm text-[var(--color-text-muted)]">{r.displayName}</span>
                <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                  {r.userCount} user{r.userCount !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
            {data.roleDistribution.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">No roles assigned yet</p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">System Summary</h3>
          <div className="space-y-3">
            <SummaryRow label="Inactive Users" value={data.stats.inactiveUsers} />
            <SummaryRow label="Navigation Items" value={data.stats.navItems} />
            <SummaryRow label="Site Settings" value={data.stats.settingsCount} />
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-2 pr-4 font-medium text-[var(--color-text-muted)]">Name</th>
                <th className="pb-2 pr-4 font-medium text-[var(--color-text-muted)]">Email</th>
                <th className="pb-2 pr-4 font-medium text-[var(--color-text-muted)]">Roles</th>
                <th className="pb-2 pr-4 font-medium text-[var(--color-text-muted)]">Status</th>
                <th className="pb-2 font-medium text-[var(--color-text-muted)]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-[var(--color-text)]">{u.name || u.username || "—"}</td>
                  <td className="py-2.5 pr-4 text-[var(--color-text-muted)]">{u.email}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {u.userRoles.map((ur) => (
                        <span key={ur.role.name} className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-[var(--color-text-muted)]">
                          {ur.role.displayName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className={`text-xs font-medium ${u.isActive ? "text-emerald-400" : "text-red-400"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-2.5 text-[var(--color-text-muted)]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent audit logs */}
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-5">
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Recent Activity</h3>
        {data.recentAuditLogs.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">No activity recorded yet</p>
        ) : (
          <div className="space-y-2">
            {data.recentAuditLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-mono text-[var(--color-text-muted)]">
                    {log.action}
                  </span>
                  <span className="text-sm text-[var(--color-text)]">{log.entity}</span>
                  {log.entityId && (
                    <span className="text-xs text-[var(--color-text-muted)]">#{log.entityId.slice(0, 8)}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <span>{log.user?.name || log.user?.email || "System"}</span>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]"}`}>
        {value}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)]">{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-white/10" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-white/5" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-lg bg-white/5" />
        <div className="h-48 rounded-lg bg-white/5" />
      </div>
      <div className="h-64 rounded-lg bg-white/5" />
    </div>
  );
}
