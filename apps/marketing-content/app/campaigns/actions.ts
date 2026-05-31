"use server";

import { revalidatePath } from "next/cache";
import type { Session } from "next-auth";
import { prisma } from "@asafarim/db";
import { auth } from "@asafarim/auth";
import { rolesCanManage, type CampaignView, type PerformanceEntryView } from "@/lib/campaigns";

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

/** Parse an optional dollar amount → cents. Empty clears (null); invalid fails. */
function parseOptionalCents(value: unknown): { ok: true; cents: number | null } | { ok: false } {
  if (value === undefined || value === null || String(value).trim() === "") return { ok: true, cents: null };
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return { ok: false };
  return { ok: true, cents: Math.round(n * 100) };
}

/** Parse an optional YYYY-MM-DD date (may be in the future). Empty clears (null). */
function parseOptionalDate(value: unknown): { ok: true; date: Date | null } | { ok: false } {
  if (value === undefined || value === null || String(value).trim() === "") return { ok: true, date: null };
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return { ok: false };
  const d = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return { ok: false };
  return { ok: true, date: d };
}

function actorName(session: Session | null): string {
  return session?.user?.name || session?.user?.email || "Unknown";
}

/** Best-effort audit trail entry; never blocks the main write. */
async function audit(
  userId: string | null,
  action: string,
  entityId: string,
  changes?: Record<string, unknown>
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: "MarketingCampaign",
        entityId,
        changes: (changes ?? undefined) as object | undefined,
      },
    });
  } catch {
    // Auditing must not break the user-facing action.
  }
}

// ── Inputs ────────────────────────────────────────────────────────────────────

export interface CreateCampaignInput {
  name: string;
  channel: string;
  status: string;
  budgetDollars: string | number;
  startedAt: string; // YYYY-MM-DD
  owner?: string;
  endsAt?: string; // YYYY-MM-DD, optional
  cpaTargetDollars?: string | number; // optional
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

export interface UpdateCampaignInput {
  id: string;
  name: string;
  channel: string;
  status: string;
  budgetDollars: string | number;
  startedAt: string; // YYYY-MM-DD
  owner?: string;
  endsAt?: string; // YYYY-MM-DD, optional
  cpaTargetDollars?: string | number; // optional
}

// ── Actions ───────────────────────────────────────────────────────────────────

export async function createCampaign(
  input: CreateCampaignInput
): Promise<ActionResult<CampaignView>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "You must be signed in." };
  if (!rolesCanManage(session?.user?.roles))
    return { ok: false, error: "You don't have permission to create campaigns." };

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

  const endsAt = parseOptionalDate(input.endsAt);
  if (!endsAt.ok) fieldErrors.endsAt = "Enter a valid end date";

  const cpaTarget = parseOptionalCents(input.cpaTargetDollars);
  if (!cpaTarget.ok) fieldErrors.cpaTargetDollars = "Enter a valid CPA target";

  if (endsAt.ok && startedAt && endsAt.date && endsAt.date.getTime() < startedAt.getTime())
    fieldErrors.endsAt = "End date must be after the start date";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const owner = (input.owner ?? "").trim() || session.user?.name || session.user?.email || "You";
  const now = new Date();

  const c = await prisma.marketingCampaign.create({
    data: {
      ownerId: userId,
      name,
      channel,
      status,
      owner,
      budgetCents: budgetCents!,
      startedAt: startedAt!,
      endsAt: endsAt.ok ? endsAt.date : null,
      cpaTargetCents: cpaTarget.ok ? cpaTarget.cents : null,
      lastEditedBy: actorName(session),
      lastEditedById: userId,
      lastEditedAt: now,
      // roll-ups start at zero; recomputed as entries are logged.
      spentCents: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
    },
  });

  await audit(userId, "campaign.create", c.id, { name, channel, status });
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
      endsAt: c.endsAt ? isoDate(c.endsAt) : null,
      cpaTargetCents: c.cpaTargetCents ?? null,
      lastEditedBy: c.lastEditedBy ?? null,
      lastEditedAt: c.lastEditedAt ? c.lastEditedAt.toISOString() : null,
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
  if (!rolesCanManage(session?.user?.roles))
    return { ok: false, error: "You don't have permission to log performance." };

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
        lastEditedBy: actorName(session),
        lastEditedById: userId,
        lastEditedAt: new Date(),
      },
    });
  }

  await audit(userId, "campaign.log_entry", campaign.id, { weekOf: input.weekOf, entryId: entry.id });
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

// ── Lifecycle actions (editor + owner) ─────────────────────────────────────────
// A write requires the editor capability (RBAC) AND ownership of the campaign.
// Shared demo campaigns (ownerId null) are read-only — mutating them would leak
// into every user's view.

/** Require an editor who owns the campaign; returns the session on success. */
async function requireManageableCampaign(
  id: string
): Promise<
  | { ok: true; userId: string; session: Session | null }
  | { ok: false; error: string }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "You must be signed in." };
  if (!rolesCanManage(session?.user?.roles))
    return { ok: false, error: "You don't have permission to manage campaigns." };

  const campaign = await prisma.marketingCampaign.findUnique({
    where: { id },
    select: { ownerId: true },
  });
  if (!campaign) return { ok: false, error: "Campaign not found." };
  if (campaign.ownerId !== userId)
    return { ok: false, error: "Only the campaign owner can change it." };

  return { ok: true, userId, session };
}

export async function updateCampaign(
  input: UpdateCampaignInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireManageableCampaign(input.id);
  if (!guard.ok) return { ok: false, error: guard.error };

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

  const endsAt = parseOptionalDate(input.endsAt);
  if (!endsAt.ok) fieldErrors.endsAt = "Enter a valid end date";

  const cpaTarget = parseOptionalCents(input.cpaTargetDollars);
  if (!cpaTarget.ok) fieldErrors.cpaTargetDollars = "Enter a valid CPA target";

  if (endsAt.ok && startedAt && endsAt.date && endsAt.date.getTime() < startedAt.getTime())
    fieldErrors.endsAt = "End date must be after the start date";

  if (Object.keys(fieldErrors).length) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const owner = (input.owner ?? "").trim() || undefined;

  await prisma.marketingCampaign.update({
    where: { id: input.id },
    data: {
      name,
      channel,
      status,
      budgetCents: budgetCents!,
      startedAt: startedAt!,
      endsAt: endsAt.ok ? endsAt.date : null,
      cpaTargetCents: cpaTarget.ok ? cpaTarget.cents : null,
      lastEditedBy: actorName(guard.session),
      lastEditedById: guard.userId,
      lastEditedAt: new Date(),
      ...(owner ? { owner } : {}),
    },
  });

  await audit(guard.userId, "campaign.update", input.id, { name, channel, status });
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${input.id}`);
  return { ok: true, data: { id: input.id } };
}

export async function setCampaignStatus(
  id: string,
  status: string
): Promise<ActionResult<{ id: string; status: string }>> {
  const guard = await requireManageableCampaign(id);
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!STATUSES.includes(status as (typeof STATUSES)[number]))
    return { ok: false, error: "Invalid status." };

  await prisma.marketingCampaign.update({
    where: { id },
    data: {
      status,
      lastEditedBy: actorName(guard.session),
      lastEditedById: guard.userId,
      lastEditedAt: new Date(),
    },
  });

  await audit(guard.userId, "campaign.status", id, { status });
  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  return { ok: true, data: { id, status } };
}

export async function deleteCampaign(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireManageableCampaign(id);
  if (!guard.ok) return { ok: false, error: guard.error };

  // Entries cascade-delete via the FK relation.
  await prisma.marketingCampaign.delete({ where: { id } });

  await audit(guard.userId, "campaign.delete", id);
  revalidatePath("/campaigns");
  return { ok: true, data: { id } };
}
