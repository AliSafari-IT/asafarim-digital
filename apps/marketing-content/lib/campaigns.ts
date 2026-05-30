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

// ── Reads ───────────────────────────────────────────────────────────────────

export async function listCampaigns(userId: string | null): Promise<CampaignView[]> {
  const rows = await prisma.marketingCampaign.findMany({
    where: visibleCampaignWhere(userId),
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { entries: { where: visibleEntryWhere(userId) } } },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    channel: c.channel,
    status: c.status,
    owner: c.owner,
    budgetCents: c.budgetCents,
    spentCents: c.spentCents,
    impressions: c.impressions,
    clicks: c.clicks,
    conversions: c.conversions,
    startedAt: isoDate(c.startedAt),
    isOwn: c.ownerId != null && c.ownerId === userId,
    entryCount: c._count.entries,
  }));
}

export async function getCampaign(
  id: string,
  userId: string | null
): Promise<CampaignView | null> {
  const c = await prisma.marketingCampaign.findFirst({
    where: { id, ...visibleCampaignWhere(userId) },
    include: {
      _count: { select: { entries: { where: visibleEntryWhere(userId) } } },
    },
  });
  if (!c) return null;

  return {
    id: c.id,
    name: c.name,
    channel: c.channel,
    status: c.status,
    owner: c.owner,
    budgetCents: c.budgetCents,
    spentCents: c.spentCents,
    impressions: c.impressions,
    clicks: c.clicks,
    conversions: c.conversions,
    startedAt: isoDate(c.startedAt),
    isOwn: c.ownerId != null && c.ownerId === userId,
    entryCount: c._count.entries,
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
