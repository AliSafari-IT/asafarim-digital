import { prisma } from "@asafarim/db";

const DAY_MS = 24 * 60 * 60 * 1000;

export type FunnelStage = {
  label: string;
  value: number;
  max: number;
};

export type GrowthOverview = {
  range: { start: Date; end: Date };
  signups: number;
  mqls: number;
  sqls: number;
  won: number;
  totalUsers: number;
  attributedSignups: number;
  funnel: FunnelStage[];
  recentSignups: RecentSignup[];
  channels: ChannelBreakdown[];
};

export type RecentSignup = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  tenantName: string | null;
  tenantPlan: string | null;
  tenantStatus: string | null;
};

export type ChannelBreakdown = {
  source: string;
  medium: string | null;
  count: number;
  pct: number; // of attributed signups
};

/**
 * Aggregate real growth signals from the monorepo DB.
 * - Signups: Users created in the window
 * - MQLs: signups who showed intent (have UTM OR a tenant)
 * - SQLs: signups tied to a tenant in trial/active
 * - Won: signups tied to a tenant whose status is active AND plan is not free
 */
export async function getGrowthOverview(windowDays = 30): Promise<GrowthOverview> {
  const end = new Date();
  const start = new Date(end.getTime() - windowDays * DAY_MS);

  const [
    signups,
    mqls,
    sqls,
    won,
    totalUsers,
    attributedSignups,
    recent,
    channelGroups,
  ] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: start } } }),
    prisma.user.count({
      where: {
        createdAt: { gte: start },
        OR: [{ utmSource: { not: null } }, { tenantId: { not: null } }],
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: start },
        tenant: { is: { status: { in: ["trial", "active"] } } },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: start },
        tenant: {
          is: { status: "active", plan: { notIn: ["free"] } },
        },
      },
    }),
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: start }, utmSource: { not: null } },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        tenant: { select: { name: true, plan: true, status: true } },
      },
    }),
    prisma.user.groupBy({
      by: ["utmSource", "utmMedium"],
      where: { createdAt: { gte: start }, utmSource: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const recentSignups: RecentSignup[] = recent.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    utmSource: u.utmSource,
    utmMedium: u.utmMedium,
    utmCampaign: u.utmCampaign,
    tenantName: u.tenant?.name ?? null,
    tenantPlan: u.tenant?.plan ?? null,
    tenantStatus: u.tenant?.status ?? null,
  }));

  const channelTotal = channelGroups.reduce((s, c) => s + c._count._all, 0);
  const channels: ChannelBreakdown[] = channelGroups
    .map((c) => ({
      source: c.utmSource ?? "(direct)",
      medium: c.utmMedium,
      count: c._count._all,
      pct: channelTotal ? c._count._all / channelTotal : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const funnel: FunnelStage[] = [
    { label: "Signups", value: signups, max: Math.max(1, signups) },
    { label: "MQLs", value: mqls, max: Math.max(1, signups) },
    { label: "SQLs", value: sqls, max: Math.max(1, signups) },
    { label: "Won", value: won, max: Math.max(1, signups) },
  ];

  return {
    range: { start, end },
    signups,
    mqls,
    sqls,
    won,
    totalUsers,
    attributedSignups,
    funnel,
    recentSignups,
    channels,
  };
}
