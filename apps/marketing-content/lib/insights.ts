// Pure, client-safe derived signals for campaign performance.
// No server imports — usable from both server components and client components.

import type { CampaignView, PerformanceEntryView } from "./campaigns";

// ── Budget pacing ─────────────────────────────────────────────────────────────

export type PacingState = "ok" | "ahead" | "over";

export interface Pacing {
  state: PacingState;
  elapsedPct: number; // 0..1 of the campaign window elapsed
  budgetPct: number; // 0..1 of budget spent
  expectedSpentCents: number; // even-burn expectation at elapsedPct
  projectedSpentCents: number; // spend extrapolated to end of window
  message: string;
}

/**
 * Pacing only applies to live campaigns with a budget and a planned end date.
 * Returns null when not applicable.
 */
export function computePacing(c: CampaignView, now: Date = new Date()): Pacing | null {
  if (c.status !== "live" || !c.endsAt || c.budgetCents <= 0) return null;

  const start = new Date(`${c.startedAt}T00:00:00Z`).getTime();
  const end = new Date(`${c.endsAt}T00:00:00Z`).getTime();
  const t = now.getTime();
  if (!(end > start)) return null;

  const elapsedPct = Math.min(1, Math.max(0, (t - start) / (end - start)));
  const budgetPct = c.spentCents / c.budgetCents;
  const expectedSpentCents = Math.round(c.budgetCents * elapsedPct);
  const projectedSpentCents =
    elapsedPct > 0 ? Math.round(c.spentCents / elapsedPct) : c.spentCents;

  let state: PacingState = "ok";
  let message = "Spend is on pace with the budget.";

  if (projectedSpentCents > c.budgetCents * 1.02) {
    state = "over";
    message = "Projected to exceed budget before the end date at the current burn rate.";
  } else if (c.spentCents > expectedSpentCents * 1.1) {
    state = "ahead";
    message = "Spend is running ahead of an even daily burn for the elapsed period.";
  }

  return { state, elapsedPct, budgetPct, expectedSpentCents, projectedSpentCents, message };
}

// ── CPA vs target ─────────────────────────────────────────────────────────────

export interface CpaStatus {
  cpaCents: number;
  targetCents: number;
  over: boolean;
  /** actual / target (e.g. 1.2 = 20% over target) */
  ratio: number;
}

export function cpaStatus(c: CampaignView): CpaStatus | null {
  if (c.cpaTargetCents == null || c.cpaTargetCents <= 0) return null;
  if (c.conversions <= 0) return null;
  const cpaCents = c.spentCents / c.conversions;
  return {
    cpaCents,
    targetCents: c.cpaTargetCents,
    over: cpaCents > c.cpaTargetCents,
    ratio: cpaCents / c.cpaTargetCents,
  };
}

// ── Weekly anomaly detection ──────────────────────────────────────────────────

export type AnomalyDirection = "spike" | "drop";

export interface Anomaly {
  direction: AnomalyDirection;
  deviationPct: number; // signed fraction vs trailing average
}

/**
 * Flags weekly entries whose conversions deviate sharply from the trailing
 * average of the prior `window` weeks. Requires at least two prior weeks to
 * avoid noise on the earliest points. `entries` must be ordered by weekOf asc.
 */
export function detectAnomalies(
  entries: PerformanceEntryView[],
  opts: { window?: number; threshold?: number } = {}
): Map<string, Anomaly> {
  const window = opts.window ?? 3;
  const threshold = opts.threshold ?? 0.4;
  const result = new Map<string, Anomaly>();

  for (let i = 2; i < entries.length; i++) {
    const priors = entries.slice(Math.max(0, i - window), i);
    if (priors.length < 2) continue;
    const avg = priors.reduce((s, e) => s + e.conversions, 0) / priors.length;
    if (avg <= 0) continue;
    const dev = (entries[i].conversions - avg) / avg;
    if (Math.abs(dev) >= threshold) {
      result.set(entries[i].id, { direction: dev >= 0 ? "spike" : "drop", deviationPct: dev });
    }
  }
  return result;
}
