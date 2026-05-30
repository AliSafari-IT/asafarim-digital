import { prisma } from "@asafarim/db";
import { auth } from "@asafarim/auth";

// ── View types ────────────────────────────────────────────────────────────────
// These mirror the shapes the campaign UI already consumes (ISO date strings,
// not Date objects), so the components stay unchanged when swapping the static
// demo arrays for persisted data.

export type Channel = "seo" | "email" | "paid" | "social" | "partner";
export type CampaignStatus = "live" | "scheduled" | "paused" | "ended";

export interface CampaignView {
  id: string;
  name: string;
  channel: string;
  status: string;
  owner: string;
  budgetCents: number;
  spentCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startedAt: string; // YYYY-MM-DD
  /** true when the signed-in user created this campaign (vs. shared demo data). */
  isOwn: boolean;
  /** number of performance entries visible to the current user. */
  entryCount: number;
}

export interface PerformanceEntryView {
  id: string;
  campaignId: string;
  weekOf: string; // YYYY-MM-DD
  impressions: number;
  clicks: number;
  conversions: number;
  spentCents: number;
  notes?: string;
  loggedBy: string;
  loggedAt: string; // ISO timestamp
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Returns the authenticated user's id, or null when unauthenticated.
 * All campaign routes are behind auth middleware, but reads stay defensive.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Campaigns the user may see: shared demo data (ownerId null) + their own. */
function visibleCampaignWhere(userId: string | null) {
  return userId
    ? { OR: [{ ownerId: null }, { ownerId: userId }] }
    : { ownerId: null };
}

/** Entries the user may see: shared seed entries + their own logged entries. */
function visibleEntryWhere(userId: string | null) {
  return userId
    ? { OR: [{ loggedById: null }, { loggedById: userId }] }
    : { loggedById: null };
}

// ── Metric aggregation (single source of truth) ──────────────────────────────
// Campaign-level totals are always derived from the sum of the campaign's
// *visible* performance entries — never from the denormalized columns — so the
// list rows and the detail page (which sums the same entries) report identical
// spend / conversions / CPA. The denormalized columns remain only as a write
// cache and are not used for display.

type Metrics = {
  spentCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  entryCount: number;
};

const ZERO_METRICS: Metrics = {
  spentCents: 0,
  impressions: 0,
  clicks: 0,
  conversions: 0,
  entryCount: 0,
};

async function aggregateEntries(
  userId: string | null,
  campaignIds: string[]
): Promise<Map<string, Metrics>> {
  const map = new Map<string, Metrics>();
  if (campaignIds.length === 0) return map;

  const groups = await prisma.marketingPerformanceEntry.groupBy({
    by: ["campaignId"],
    where: { campaignId: { in: campaignIds }, ...visibleEntryWhere(userId) },
    _sum: { spentCents: true, impressions: true, clicks: true, conversions: true },
    _count: { _all: true },
  });

  for (const g of groups) {
    map.set(g.campaignId, {
      spentCents: g._sum.spentCents ?? 0,
      impressions: g._sum.impressions ?? 0,
      clicks: g._sum.clicks ?? 0,
      conversions: g._sum.conversions ?? 0,
      entryCount: g._count._all,
    });
  }
  return map;
}

// ── Reads ───────────────────────────────────────────────────────────────────

export async function listCampaigns(userId: string | null): Promise<CampaignView[]> {
  const rows = await prisma.marketingCampaign.findMany({
    where: visibleCampaignWhere(userId),
    orderBy: { createdAt: "asc" },
  });

  const metrics = await aggregateEntries(
    userId,
    rows.map((c) => c.id)
  );

  return rows.map((c) => {
    const m = metrics.get(c.id) ?? ZERO_METRICS;
    return {
      id: c.id,
      name: c.name,
      channel: c.channel,
      status: c.status,
      owner: c.owner,
      budgetCents: c.budgetCents,
      spentCents: m.spentCents,
      impressions: m.impressions,
      clicks: m.clicks,
      conversions: m.conversions,
      startedAt: isoDate(c.startedAt),
      isOwn: c.ownerId != null && c.ownerId === userId,
      entryCount: m.entryCount,
    };
  });
}

export async function getCampaign(
  id: string,
  userId: string | null
): Promise<CampaignView | null> {
  const c = await prisma.marketingCampaign.findFirst({
    where: { id, ...visibleCampaignWhere(userId) },
  });
  if (!c) return null;

  const m = (await aggregateEntries(userId, [c.id])).get(c.id) ?? ZERO_METRICS;

  return {
    id: c.id,
    name: c.name,
    channel: c.channel,
    status: c.status,
    owner: c.owner,
    budgetCents: c.budgetCents,
    spentCents: m.spentCents,
    impressions: m.impressions,
    clicks: m.clicks,
    conversions: m.conversions,
    startedAt: isoDate(c.startedAt),
    isOwn: c.ownerId != null && c.ownerId === userId,
    entryCount: m.entryCount,
  };
}

export async function listEntries(
  campaignId: string,
  userId: string | null
): Promise<PerformanceEntryView[]> {
  const rows = await prisma.marketingPerformanceEntry.findMany({
    where: { campaignId, ...visibleEntryWhere(userId) },
    orderBy: { weekOf: "asc" },
  });

  return rows.map((e) => ({
    id: e.id,
    campaignId: e.campaignId,
    weekOf: isoDate(e.weekOf),
    impressions: e.impressions,
    clicks: e.clicks,
    conversions: e.conversions,
    spentCents: e.spentCents,
    notes: e.notes ?? undefined,
    loggedBy: e.loggedBy,
    loggedAt: e.loggedAt.toISOString(),
  }));
}
