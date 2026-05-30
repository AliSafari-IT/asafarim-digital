"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@asafarim/db";
import { auth } from "@asafarim/auth";
import type { CampaignView, PerformanceEntryView } from "@/lib/campaigns";

const CHANNELS = ["seo", "email", "paid", "social", "partner"] as const;
const STATUSES = ["live", "scheduled", "paused", "ended"] as const;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// ── Validation helpers ────────────────────────────────────────────────────────

/** Parse a value as a non-negative integer; returns null when invalid. */
function parseCount(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

/** Parse a dollar amount into non-negative integer cents; null when invalid. */
function parseCents(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** Validate a YYYY-MM-DD date that is not in the future. */
function parsePastDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  // Allow today; reject future weeks.
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);
  if (d.getTime() > todayEnd.getTime()) return null;
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface CreateCampaignInput {
  name: string;
  channel: string;
  status: string;
  budgetDollars: string | number;
  startedAt: string; // YYYY-MM-DD
  owner?: string;
}

export interface LogEntryInput {
  campaignId: string;
  weekOf: string; // YYYY-MM-DD
  impressions: string | number;
  clicks: string | number;
  conversions: string | number;
  spentDollars: string | number;
  notes?: string;
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createCampaign(
  input: CreateCampaignInput
): Promise<ActionResult<CampaignView>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "You must be signed in." };

  const fieldErrors: Record<string, string> = {};

  const name = (input.name ?? "").trim();
  if (!name) fieldErrors.name = "Name is required";
  else if (name.length > 120) fieldErrors.name = "Keep the name under 120 characters";

  const channel = String(input.channel);
  if (!CHANNELS.includes(channel as (typeof CHANNELS)[number]))
    fieldErrors.channel = "Choose a valid channel";

  const status = String(input.status);
  if (!STATUSES.includes(status as (typeof STATUSES)[number]))
    fieldErrors.status = "Choose a valid status";

  const budgetCents = parseCents(input.budgetDollars);
  if (budgetCents === null) fieldErrors.budgetDollars = "Enter a valid budget";

  const startedAt = parsePastDate(input.startedAt);
  if (!startedAt) fieldErrors.startedAt = "Enter a valid start date (not in the future)";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const owner = (input.owner ?? "").trim() || session.user?.name || session.user?.email || "You";

  const c = await prisma.marketingCampaign.create({
    data: {
      ownerId: userId,
      name,
      channel,
      status,
      owner,
      budgetCents: budgetCents!,
      startedAt: startedAt!,
      // roll-ups start at zero; recomputed as entries are logged.
      spentCents: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    },
  });

  revalidatePath("/campaigns");

  return {
    ok: true,
    data: {
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
      isOwn: true,
      entryCount: 0,
    },
  };
}

export async function logPerformanceEntry(
  input: LogEntryInput
): Promise<ActionResult<PerformanceEntryView>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "You must be signed in." };

  // The campaign must be visible to the user (shared demo or their own).
  const campaign = await prisma.marketingCampaign.findFirst({
    where: { id: input.campaignId, OR: [{ ownerId: null }, { ownerId: userId }] },
    select: { id: true, ownerId: true },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };

  const fieldErrors: Record<string, string> = {};

  const weekOf = parsePastDate(input.weekOf);
  if (!weekOf) fieldErrors.weekOf = "Enter a valid week (not in the future)";

  const impressions = parseCount(input.impressions);
  if (impressions === null) fieldErrors.impressions = "Enter a valid number";

  const clicks = parseCount(input.clicks);
  if (clicks === null) fieldErrors.clicks = "Enter a valid number";

  const conversions = parseCount(input.conversions);
  if (conversions === null) fieldErrors.conversions = "Enter a valid number";

  const spentCents = parseCents(input.spentDollars);
  if (spentCents === null) fieldErrors.spentDollars = "Enter a valid amount";

  const notes = (input.notes ?? "").trim();
  if (notes.length > 2000) fieldErrors.notes = "Keep notes under 2000 characters";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const loggedBy = session.user?.name || session.user?.email || "You";

  const entry = await prisma.marketingPerformanceEntry.create({
    data: {
      campaignId: campaign.id,
      weekOf: weekOf!,
      impressions: impressions!,
      clicks: clicks!,
      conversions: conversions!,
      spentCents: spentCents!,
      notes: notes || null,
      loggedBy,
      loggedById: userId,
    },
  });

  // Keep denormalized roll-ups in sync for campaigns the user owns. Shared demo
  // campaigns keep their seed totals (a user's private entry must not leak into
  // the global showcase numbers). Full list/detail reconciliation is M2.
  if (campaign.ownerId === userId) {
    const agg = await prisma.marketingPerformanceEntry.aggregate({
      where: { campaignId: campaign.id, loggedById: userId },
      _sum: { impressions: true, clicks: true, conversions: true, spentCents: true },
    });
    await prisma.marketingCampaign.update({
      where: { id: campaign.id },
      data: {
        impressions: agg._sum.impressions ?? 0,
        clicks: agg._sum.clicks ?? 0,
        conversions: agg._sum.conversions ?? 0,
        spentCents: agg._sum.spentCents ?? 0,
      },
    });
  }

  revalidatePath(`/campaigns/${campaign.id}`);
  revalidatePath("/campaigns");

  return {
    ok: true,
    data: {
      id: entry.id,
      campaignId: entry.campaignId,
      weekOf: isoDate(entry.weekOf),
      impressions: entry.impressions,
      clicks: entry.clicks,
      conversions: entry.conversions,
      spentCents: entry.spentCents,
      notes: entry.notes ?? undefined,
      loggedBy: entry.loggedBy,
      loggedAt: entry.loggedAt.toISOString(),
    },
  };
}
