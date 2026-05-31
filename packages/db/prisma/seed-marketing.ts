/**
 * Seed the Marketing + Content engine showcase dataset.
 *
 * These records form the shared demo surface for the marketing-content app:
 * every campaign and performance entry is created with ownerId / loggedById
 * = null, which the app treats as "shared demo data visible to all users".
 * User-created campaigns and entries carry their own owner and stay private.
 *
 * Idempotent: keyed by the stable demo ids (c1.., pe-c1-w1..), so re-running
 * updates in place instead of duplicating.
 *
 * Run with: pnpm --filter @asafarim/db db:seed-marketing
 */

import { prisma } from "../src/index";

type CampaignSeed = {
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
  startedAt: string;
  endsAt: string | null;
  cpaTargetCents: number | null;
};

type EntrySeed = {
  id: string;
  campaignId: string;
  weekOf: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spentCents: number;
  notes?: string;
  loggedBy: string;
  loggedAt: string;
};

const campaigns: CampaignSeed[] = [
  { id: "c1", name: "Q2 Growth — Ops Hub launch", channel: "paid", status: "live", owner: "Ava Chen", budgetCents: 1_200_000, spentCents: 812_400, impressions: 412_800, clicks: 18_420, conversions: 612, startedAt: "2026-03-18", endsAt: "2026-06-30", cpaTargetCents: 1_500 },
  { id: "c2", name: "SEO cluster: agent workflows", channel: "seo", status: "live", owner: "Noah Park", budgetCents: 400_000, spentCents: 220_000, impressions: 268_100, clicks: 9_850, conversions: 441, startedAt: "2026-02-04", endsAt: "2026-07-31", cpaTargetCents: 600 },
  { id: "c3", name: "Lifecycle nurture v4", channel: "email", status: "live", owner: "Priya Raman", budgetCents: 180_000, spentCents: 96_300, impressions: 54_200, clicks: 7_140, conversions: 389, startedAt: "2026-03-01", endsAt: "2026-06-15", cpaTargetCents: 500 },
  { id: "c4", name: "LinkedIn founder series", channel: "social", status: "live", owner: "Marcus King", budgetCents: 250_000, spentCents: 134_900, impressions: 186_500, clicks: 6_220, conversions: 141, startedAt: "2026-03-10", endsAt: "2026-06-10", cpaTargetCents: 800 },
  { id: "c5", name: "Partner co-marketing — Stripe", channel: "partner", status: "scheduled", owner: "Ava Chen", budgetCents: 500_000, spentCents: 0, impressions: 0, clicks: 0, conversions: 0, startedAt: "2026-05-02", endsAt: null, cpaTargetCents: 20_000 },
  { id: "c6", name: "Retargeting — pricing page", channel: "paid", status: "live", owner: "Noah Park", budgetCents: 300_000, spentCents: 241_100, impressions: 142_700, clicks: 4_980, conversions: 198, startedAt: "2026-02-20", endsAt: "2026-07-15", cpaTargetCents: 1_300 },
  { id: "c7", name: "Webinar: Measuring AI ROI", channel: "email", status: "ended", owner: "Priya Raman", budgetCents: 120_000, spentCents: 118_700, impressions: 38_900, clicks: 5_110, conversions: 262, startedAt: "2026-01-14", endsAt: null, cpaTargetCents: 400 },
  { id: "c8", name: "Community push: r/devtools", channel: "social", status: "paused", owner: "Marcus King", budgetCents: 80_000, spentCents: 44_200, impressions: 72_300, clicks: 2_140, conversions: 48, startedAt: "2026-02-28", endsAt: null, cpaTargetCents: 4_500 },
];

const performanceEntries: EntrySeed[] = [
  // c1
  { id: "pe-c1-w1", campaignId: "c1", weekOf: "2026-03-18", impressions: 38_200, clicks: 1_620, conversions: 47, spentCents: 98_000, notes: "Launch week — awareness phase, CPM higher than expected.", loggedBy: "Ava Chen", loggedAt: "2026-03-25T10:02:00Z" },
  { id: "pe-c1-w2", campaignId: "c1", weekOf: "2026-03-25", impressions: 54_100, clicks: 2_340, conversions: 71, spentCents: 128_000, notes: "Bid strategy adjusted; CTR improved after headline A/B test.", loggedBy: "Ava Chen", loggedAt: "2026-04-01T09:14:00Z" },
  { id: "pe-c1-w3", campaignId: "c1", weekOf: "2026-04-01", impressions: 61_400, clicks: 2_870, conversions: 96, spentCents: 141_000, notes: "Best week so far — retargeting layer activated.", loggedBy: "Noah Park", loggedAt: "2026-04-08T11:30:00Z" },
  { id: "pe-c1-w4", campaignId: "c1", weekOf: "2026-04-08", impressions: 72_600, clicks: 3_240, conversions: 118, spentCents: 162_000, notes: "Blog post amplification drove incremental conversions.", loggedBy: "Ava Chen", loggedAt: "2026-04-15T08:45:00Z" },
  { id: "pe-c1-w5", campaignId: "c1", weekOf: "2026-04-15", impressions: 78_300, clicks: 3_510, conversions: 134, spentCents: 170_000, notes: "Peak reach — frequency cap lowered to preserve brand sentiment.", loggedBy: "Noah Park", loggedAt: "2026-04-22T10:00:00Z" },
  { id: "pe-c1-w6", campaignId: "c1", weekOf: "2026-04-22", impressions: 63_100, clicks: 2_780, conversions: 98, spentCents: 150_000, notes: "Slight dip; competitor launched counter-campaign.", loggedBy: "Ava Chen", loggedAt: "2026-04-29T09:25:00Z" },
  { id: "pe-c1-w7", campaignId: "c1", weekOf: "2026-04-29", impressions: 45_100, clicks: 2_060, conversions: 48, spentCents: 98_000, notes: "Budget pacing to month-end. CPA remains within $140 target.", loggedBy: "Ava Chen", loggedAt: "2026-05-06T09:10:00Z" },
  // c2
  { id: "pe-c2-w1", campaignId: "c2", weekOf: "2026-02-04", impressions: 14_200, clicks: 520, conversions: 22, spentCents: 14_000, notes: "Initial content sprint; 4 new guides published.", loggedBy: "Noah Park", loggedAt: "2026-02-11T12:00:00Z" },
  { id: "pe-c2-w2", campaignId: "c2", weekOf: "2026-02-11", impressions: 18_400, clicks: 680, conversions: 31, spentCents: 18_000, notes: "Internal link pass done — impressions +30% WoW.", loggedBy: "Noah Park", loggedAt: "2026-02-18T11:30:00Z" },
  { id: "pe-c2-w3", campaignId: "c2", weekOf: "2026-02-18", impressions: 21_900, clicks: 810, conversions: 38, spentCents: 20_000, notes: "Featured snippet captured for 'ai agent workflow tools'.", loggedBy: "Noah Park", loggedAt: "2026-02-25T10:45:00Z" },
  { id: "pe-c2-w4", campaignId: "c2", weekOf: "2026-02-25", impressions: 24_600, clicks: 950, conversions: 44, spentCents: 22_000, notes: "Added schema markup — click-through rate up 8%.", loggedBy: "Ava Chen", loggedAt: "2026-03-04T09:00:00Z" },
  { id: "pe-c2-w5", campaignId: "c2", weekOf: "2026-03-04", impressions: 27_100, clicks: 1_080, conversions: 50, spentCents: 24_000, notes: "Video embed added to top guide — dwell time up.", loggedBy: "Noah Park", loggedAt: "2026-03-11T11:15:00Z" },
  { id: "pe-c2-w6", campaignId: "c2", weekOf: "2026-03-11", impressions: 29_800, clicks: 1_190, conversions: 57, spentCents: 26_000, notes: "Average position improved 4.8 to 3.9 for top 5 keywords.", loggedBy: "Noah Park", loggedAt: "2026-03-18T10:30:00Z" },
  { id: "pe-c2-w7", campaignId: "c2", weekOf: "2026-03-18", impressions: 32_400, clicks: 1_320, conversions: 62, spentCents: 28_000, notes: "Seasonal spike in 'agent workflow' searches.", loggedBy: "Ava Chen", loggedAt: "2026-03-25T09:45:00Z" },
  { id: "pe-c2-w8", campaignId: "c2", weekOf: "2026-03-25", impressions: 33_700, clicks: 1_400, conversions: 68, spentCents: 28_000, notes: "Blog amplification from paid campaign (c1) cross-traffic.", loggedBy: "Noah Park", loggedAt: "2026-04-01T10:00:00Z" },
  { id: "pe-c2-w9", campaignId: "c2", weekOf: "2026-04-01", impressions: 34_500, clicks: 1_430, conversions: 69, spentCents: 28_000, notes: "Stable week; monitoring for algorithm update.", loggedBy: "Noah Park", loggedAt: "2026-04-08T11:00:00Z" },
  // c3
  { id: "pe-c3-w1", campaignId: "c3", weekOf: "2026-03-01", impressions: 4_800, clicks: 620, conversions: 32, spentCents: 9_000, notes: "Email 1 deployed — open rate 41%, best in history.", loggedBy: "Priya Raman", loggedAt: "2026-03-08T09:30:00Z" },
  { id: "pe-c3-w2", campaignId: "c3", weekOf: "2026-03-08", impressions: 6_100, clicks: 810, conversions: 46, spentCents: 11_000, notes: "Email 2 (day 3) boosted by personalised subject line test.", loggedBy: "Priya Raman", loggedAt: "2026-03-15T10:00:00Z" },
  { id: "pe-c3-w3", campaignId: "c3", weekOf: "2026-03-15", impressions: 7_400, clicks: 980, conversions: 58, spentCents: 13_000, notes: "Activation push landed 58 trials — pipeline impact visible.", loggedBy: "Priya Raman", loggedAt: "2026-03-22T11:15:00Z" },
  { id: "pe-c3-w4", campaignId: "c3", weekOf: "2026-03-22", impressions: 8_200, clicks: 1_080, conversions: 64, spentCents: 14_000, notes: "Segmented high-score leads to SDR hand-off flow.", loggedBy: "Priya Raman", loggedAt: "2026-03-29T09:45:00Z" },
  { id: "pe-c3-w5", campaignId: "c3", weekOf: "2026-03-29", impressions: 9_600, clicks: 1_240, conversions: 72, spentCents: 16_000, notes: "Week 5 drip fired — churn_risk cohort added.", loggedBy: "Priya Raman", loggedAt: "2026-04-05T10:30:00Z" },
  { id: "pe-c3-w6", campaignId: "c3", weekOf: "2026-04-05", impressions: 9_800, clicks: 1_190, conversions: 68, spentCents: 16_000, notes: "Slight drop — Easter weekend suppressed opens Fri-Sun.", loggedBy: "Priya Raman", loggedAt: "2026-04-12T09:00:00Z" },
  { id: "pe-c3-w7", campaignId: "c3", weekOf: "2026-04-12", impressions: 8_300, clicks: 1_220, conversions: 49, spentCents: 17_300, notes: "New cohort (week 7 re-engagement) just kicked off.", loggedBy: "Priya Raman", loggedAt: "2026-04-19T10:15:00Z" },
  // c4
  { id: "pe-c4-w1", campaignId: "c4", weekOf: "2026-03-10", impressions: 18_600, clicks: 580, conversions: 12, spentCents: 14_000, notes: "Episode 1 posted — organic amplification exceeded target.", loggedBy: "Marcus King", loggedAt: "2026-03-17T10:00:00Z" },
  { id: "pe-c4-w2", campaignId: "c4", weekOf: "2026-03-17", impressions: 24_400, clicks: 780, conversions: 19, spentCents: 18_000, notes: "Episode 2 (pricing tension) — highest engagement so far.", loggedBy: "Marcus King", loggedAt: "2026-03-24T09:30:00Z" },
  { id: "pe-c4-w3", campaignId: "c4", weekOf: "2026-03-24", impressions: 27_100, clicks: 870, conversions: 24, spentCents: 21_000, notes: "Comment velocity high — boosted episode 3 with $3k.", loggedBy: "Marcus King", loggedAt: "2026-03-31T11:00:00Z" },
  { id: "pe-c4-w4", campaignId: "c4", weekOf: "2026-03-31", impressions: 31_200, clicks: 1_010, conversions: 29, spentCents: 24_000, notes: "Audience targeting refined — follower lookalike added.", loggedBy: "Marcus King", loggedAt: "2026-04-07T10:30:00Z" },
  { id: "pe-c4-w5", campaignId: "c4", weekOf: "2026-04-07", impressions: 34_800, clicks: 1_120, conversions: 31, spentCents: 26_000, notes: "Best reach week — thought-leader re-share drove spikes.", loggedBy: "Marcus King", loggedAt: "2026-04-14T09:45:00Z" },
  { id: "pe-c4-w6", campaignId: "c4", weekOf: "2026-04-14", impressions: 30_400, clicks: 960, conversions: 18, spentCents: 22_000, notes: "Engagement normalising; refresh creative for ep 7.", loggedBy: "Marcus King", loggedAt: "2026-04-21T10:15:00Z" },
  { id: "pe-c4-w7", campaignId: "c4", weekOf: "2026-04-21", impressions: 20_000, clicks: 900, conversions: 8, spentCents: 9_900, notes: "Pacing to budget ceiling; held spend for May push.", loggedBy: "Marcus King", loggedAt: "2026-04-28T11:00:00Z" },
  // c7
  { id: "pe-c7-w1", campaignId: "c7", weekOf: "2026-01-14", impressions: 8_200, clicks: 1_040, conversions: 52, spentCents: 24_000, notes: "Invitation blast sent; 52 registrations day 1.", loggedBy: "Priya Raman", loggedAt: "2026-01-21T10:00:00Z" },
  { id: "pe-c7-w2", campaignId: "c7", weekOf: "2026-01-21", impressions: 9_800, clicks: 1_320, conversions: 76, spentCents: 29_000, notes: "Reminder sequence boosted attendance intent.", loggedBy: "Priya Raman", loggedAt: "2026-01-28T09:30:00Z" },
  { id: "pe-c7-w3", campaignId: "c7", weekOf: "2026-01-28", impressions: 11_400, clicks: 1_600, conversions: 88, spentCents: 34_000, notes: "Webinar week — live attendees 310 (target: 250).", loggedBy: "Priya Raman", loggedAt: "2026-02-04T10:15:00Z" },
  { id: "pe-c7-w4", campaignId: "c7", weekOf: "2026-02-04", impressions: 9_500, clicks: 1_150, conversions: 46, spentCents: 31_700, notes: "On-demand replay sent; replay CVR 14% above estimate.", loggedBy: "Priya Raman", loggedAt: "2026-02-11T11:00:00Z" },
];

async function main() {
  console.log("🌱 Seeding Marketing + Content showcase dataset...");

  // Seed in order so createdAt increments c1..c8 (preserves list order).
  let order = 0;
  for (const c of campaigns) {
    const base = {
      ownerId: null,
      name: c.name,
      channel: c.channel,
      status: c.status,
      owner: c.owner,
      budgetCents: c.budgetCents,
      spentCents: c.spentCents,
      impressions: c.impressions,
      clicks: c.clicks,
      conversions: c.conversions,
      startedAt: new Date(`${c.startedAt}T00:00:00Z`),
      endsAt: c.endsAt ? new Date(`${c.endsAt}T00:00:00Z`) : null,
      cpaTargetCents: c.cpaTargetCents,
      createdAt: new Date(Date.UTC(2026, 0, 1) + order * 60_000),
    };
    await prisma.marketingCampaign.upsert({
      where: { id: c.id },
      update: base,
      create: { id: c.id, ...base },
    });
    order += 1;
    console.log(`  ✓ Campaign: ${c.id} — ${c.name}`);
  }

  for (const e of performanceEntries) {
    const base = {
      campaignId: e.campaignId,
      weekOf: new Date(`${e.weekOf}T00:00:00Z`),
      impressions: e.impressions,
      clicks: e.clicks,
      conversions: e.conversions,
      spentCents: e.spentCents,
      notes: e.notes ?? null,
      loggedBy: e.loggedBy,
      loggedById: null,
      loggedAt: new Date(e.loggedAt),
    };
    await prisma.marketingPerformanceEntry.upsert({
      where: { id: e.id },
      update: base,
      create: { id: e.id, ...base },
    });
  }
  console.log(`  ✓ Performance entries: ${performanceEntries.length}`);

  console.log("✅ Marketing showcase dataset seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
