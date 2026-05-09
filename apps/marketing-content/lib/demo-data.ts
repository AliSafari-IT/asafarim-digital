// Realistic mock data for the Marketing + Content Engine showcase.
// All numbers are static but chosen to feel like a mid-stage B2B SaaS.

// ── Performance Entries ──────────────────────────────────────────────────────

export interface PerformanceEntry {
  id: string;
  campaignId: string;
  weekOf: string;        // ISO date of the Monday that starts this reporting week
  impressions: number;
  clicks: number;
  conversions: number;
  spentCents: number;
  ctr?: number;          // computed: clicks / impressions
  cvr?: number;          // computed: conversions / clicks
  notes?: string;
  loggedBy: string;
  loggedAt: string;      // ISO timestamp of when the entry was logged
}

// Weekly performance snapshots for active + ended campaigns.
// Numbers roughly track toward campaign-level totals in the campaigns array.
export const performanceEntries: PerformanceEntry[] = [
  // ── c1: Q2 Growth — Ops Hub launch (paid, started 2026-03-18) ──────────────
  { id: "pe-c1-w1", campaignId: "c1", weekOf: "2026-03-18", impressions: 38_200, clicks: 1_620, conversions: 47,  spentCents:  98_000, notes: "Launch week — awareness phase, CPM higher than expected.", loggedBy: "Ava Chen",     loggedAt: "2026-03-25T10:02:00Z" },
  { id: "pe-c1-w2", campaignId: "c1", weekOf: "2026-03-25", impressions: 54_100, clicks: 2_340, conversions: 71,  spentCents: 128_000, notes: "Bid strategy adjusted; CTR improved after headline A/B test.", loggedBy: "Ava Chen",   loggedAt: "2026-04-01T09:14:00Z" },
  { id: "pe-c1-w3", campaignId: "c1", weekOf: "2026-04-01", impressions: 61_400, clicks: 2_870, conversions: 96,  spentCents: 141_000, notes: "Best week so far — retargeting layer activated.", loggedBy: "Noah Park",         loggedAt: "2026-04-08T11:30:00Z" },
  { id: "pe-c1-w4", campaignId: "c1", weekOf: "2026-04-08", impressions: 72_600, clicks: 3_240, conversions: 118, spentCents: 162_000, notes: "Blog post amplification drove incremental conversions.", loggedBy: "Ava Chen",     loggedAt: "2026-04-15T08:45:00Z" },
  { id: "pe-c1-w5", campaignId: "c1", weekOf: "2026-04-15", impressions: 78_300, clicks: 3_510, conversions: 134, spentCents: 170_000, notes: "Peak reach — frequency cap lowered to preserve brand sentiment.", loggedBy: "Noah Park", loggedAt: "2026-04-22T10:00:00Z" },
  { id: "pe-c1-w6", campaignId: "c1", weekOf: "2026-04-22", impressions: 63_100, clicks: 2_780, conversions: 98,  spentCents: 150_000, notes: "Slight dip; competitor launched counter-campaign.", loggedBy: "Ava Chen",          loggedAt: "2026-04-29T09:25:00Z" },
  { id: "pe-c1-w7", campaignId: "c1", weekOf: "2026-04-29", impressions: 45_100, clicks: 2_060, conversions: 48,  spentCents:  98_000, notes: "Budget pacing to month-end. CPA remains within $140 target.", loggedBy: "Ava Chen",  loggedAt: "2026-05-06T09:10:00Z" },

  // ── c2: SEO cluster: agent workflows (seo, started 2026-02-04) ─────────────
  { id: "pe-c2-w1", campaignId: "c2", weekOf: "2026-02-04", impressions: 14_200, clicks:  520, conversions: 22,  spentCents: 14_000, notes: "Initial content sprint; 4 new guides published.", loggedBy: "Noah Park",              loggedAt: "2026-02-11T12:00:00Z" },
  { id: "pe-c2-w2", campaignId: "c2", weekOf: "2026-02-11", impressions: 18_400, clicks:  680, conversions: 31,  spentCents: 18_000, notes: "Internal link pass done — impressions +30% WoW.", loggedBy: "Noah Park",              loggedAt: "2026-02-18T11:30:00Z" },
  { id: "pe-c2-w3", campaignId: "c2", weekOf: "2026-02-18", impressions: 21_900, clicks:  810, conversions: 38,  spentCents: 20_000, notes: "Featured snippet captured for 'ai agent workflow tools'.", loggedBy: "Noah Park",    loggedAt: "2026-02-25T10:45:00Z" },
  { id: "pe-c2-w4", campaignId: "c2", weekOf: "2026-02-25", impressions: 24_600, clicks:  950, conversions: 44,  spentCents: 22_000, notes: "Added schema markup — click-through rate up 8%.", loggedBy: "Ava Chen",               loggedAt: "2026-03-04T09:00:00Z" },
  { id: "pe-c2-w5", campaignId: "c2", weekOf: "2026-03-04", impressions: 27_100, clicks: 1_080, conversions: 50, spentCents: 24_000, notes: "Video embed added to top guide — dwell time ↑.", loggedBy: "Noah Park",              loggedAt: "2026-03-11T11:15:00Z" },
  { id: "pe-c2-w6", campaignId: "c2", weekOf: "2026-03-11", impressions: 29_800, clicks: 1_190, conversions: 57, spentCents: 26_000, notes: "Average position improved 4.8→3.9 for top 5 keywords.", loggedBy: "Noah Park",      loggedAt: "2026-03-18T10:30:00Z" },
  { id: "pe-c2-w7", campaignId: "c2", weekOf: "2026-03-18", impressions: 32_400, clicks: 1_320, conversions: 62, spentCents: 28_000, notes: "Seasonal spike in 'agent workflow' searches.", loggedBy: "Ava Chen",                loggedAt: "2026-03-25T09:45:00Z" },
  { id: "pe-c2-w8", campaignId: "c2", weekOf: "2026-03-25", impressions: 33_700, clicks: 1_400, conversions: 68, spentCents: 28_000, notes: "Blog amplification from paid campaign (c1) cross-traffic.", loggedBy: "Noah Park",   loggedAt: "2026-04-01T10:00:00Z" },
  { id: "pe-c2-w9", campaignId: "c2", weekOf: "2026-04-01", impressions: 34_500, clicks: 1_430, conversions: 69, spentCents: 28_000, notes: "Stable week; monitoring for algorithm update.", loggedBy: "Noah Park",              loggedAt: "2026-04-08T11:00:00Z" },

  // ── c3: Lifecycle nurture v4 (email, started 2026-03-01) ───────────────────
  { id: "pe-c3-w1", campaignId: "c3", weekOf: "2026-03-01", impressions:  4_800, clicks:  620, conversions: 32,  spentCents:  9_000, notes: "Email 1 deployed — open rate 41%, best in history.", loggedBy: "Priya Raman",       loggedAt: "2026-03-08T09:30:00Z" },
  { id: "pe-c3-w2", campaignId: "c3", weekOf: "2026-03-08", impressions:  6_100, clicks:  810, conversions: 46,  spentCents: 11_000, notes: "Email 2 (day 3) boosted by personalised subject line test.", loggedBy: "Priya Raman", loggedAt: "2026-03-15T10:00:00Z" },
  { id: "pe-c3-w3", campaignId: "c3", weekOf: "2026-03-15", impressions:  7_400, clicks:  980, conversions: 58,  spentCents: 13_000, notes: "Activation push landed 58 trials — pipeline impact visible.", loggedBy: "Priya Raman", loggedAt: "2026-03-22T11:15:00Z" },
  { id: "pe-c3-w4", campaignId: "c3", weekOf: "2026-03-22", impressions:  8_200, clicks: 1_080, conversions: 64, spentCents: 14_000, notes: "Segmented high-score leads to SDR hand-off flow.", loggedBy: "Priya Raman",         loggedAt: "2026-03-29T09:45:00Z" },
  { id: "pe-c3-w5", campaignId: "c3", weekOf: "2026-03-29", impressions:  9_600, clicks: 1_240, conversions: 72, spentCents: 16_000, notes: "Week 5 drip fired — churn_risk cohort added.", loggedBy: "Priya Raman",              loggedAt: "2026-04-05T10:30:00Z" },
  { id: "pe-c3-w6", campaignId: "c3", weekOf: "2026-04-05", impressions:  9_800, clicks: 1_190, conversions: 68, spentCents: 16_000, notes: "Slight drop — Easter weekend suppressed opens Fri-Sun.", loggedBy: "Priya Raman",   loggedAt: "2026-04-12T09:00:00Z" },
  { id: "pe-c3-w7", campaignId: "c3", weekOf: "2026-04-12", impressions:  8_300, clicks: 1_220, conversions: 49, spentCents: 17_300, notes: "New cohort (week 7 re-engagement) just kicked off.", loggedBy: "Priya Raman",        loggedAt: "2026-04-19T10:15:00Z" },

  // ── c4: LinkedIn founder series (social, started 2026-03-10) ───────────────
  { id: "pe-c4-w1", campaignId: "c4", weekOf: "2026-03-10", impressions: 18_600, clicks:  580, conversions: 12, spentCents: 14_000, notes: "Episode 1 posted — organic amplification exceeded target.", loggedBy: "Marcus King",  loggedAt: "2026-03-17T10:00:00Z" },
  { id: "pe-c4-w2", campaignId: "c4", weekOf: "2026-03-17", impressions: 24_400, clicks:  780, conversions: 19, spentCents: 18_000, notes: "Episode 2 (pricing tension) — highest engagement so far.", loggedBy: "Marcus King",   loggedAt: "2026-03-24T09:30:00Z" },
  { id: "pe-c4-w3", campaignId: "c4", weekOf: "2026-03-24", impressions: 27_100, clicks:  870, conversions: 24, spentCents: 21_000, notes: "Comment velocity high — boosted episode 3 with $3k.", loggedBy: "Marcus King",       loggedAt: "2026-03-31T11:00:00Z" },
  { id: "pe-c4-w4", campaignId: "c4", weekOf: "2026-03-31", impressions: 31_200, clicks: 1_010, conversions: 29, spentCents: 24_000, notes: "Audience targeting refined — follower lookalike added.", loggedBy: "Marcus King",    loggedAt: "2026-04-07T10:30:00Z" },
  { id: "pe-c4-w5", campaignId: "c4", weekOf: "2026-04-07", impressions: 34_800, clicks: 1_120, conversions: 31, spentCents: 26_000, notes: "Best reach week — thought-leader re-share drove spikes.", loggedBy: "Marcus King",   loggedAt: "2026-04-14T09:45:00Z" },
  { id: "pe-c4-w6", campaignId: "c4", weekOf: "2026-04-14", impressions: 30_400, clicks:  960, conversions: 18, spentCents: 22_000, notes: "Engagement normalising; refresh creative for ep 7.", loggedBy: "Marcus King",         loggedAt: "2026-04-21T10:15:00Z" },
  { id: "pe-c4-w7", campaignId: "c4", weekOf: "2026-04-21", impressions: 20_000, clicks:  900, conversions: 8,  spentCents:  9_900, notes: "Pacing to budget ceiling; held spend for May push.", loggedBy: "Marcus King",         loggedAt: "2026-04-28T11:00:00Z" },

  // ── c7: Webinar: Measuring AI ROI (email, ended, started 2026-01-14) ────────
  { id: "pe-c7-w1", campaignId: "c7", weekOf: "2026-01-14", impressions:  8_200, clicks: 1_040, conversions: 52,  spentCents: 24_000, notes: "Invitation blast sent; 52 registrations day 1.", loggedBy: "Priya Raman",           loggedAt: "2026-01-21T10:00:00Z" },
  { id: "pe-c7-w2", campaignId: "c7", weekOf: "2026-01-21", impressions:  9_800, clicks: 1_320, conversions: 76,  spentCents: 29_000, notes: "Reminder sequence boosted attendance intent.", loggedBy: "Priya Raman",             loggedAt: "2026-01-28T09:30:00Z" },
  { id: "pe-c7-w3", campaignId: "c7", weekOf: "2026-01-28", impressions: 11_400, clicks: 1_600, conversions: 88,  spentCents: 34_000, notes: "Webinar week — live attendees 310 (target: 250) 🎉.", loggedBy: "Priya Raman",     loggedAt: "2026-02-04T10:15:00Z" },
  { id: "pe-c7-w4", campaignId: "c7", weekOf: "2026-02-04", impressions:  9_500, clicks: 1_150, conversions: 46,  spentCents: 31_700, notes: "On-demand replay sent; replay CVR 14% above estimate.", loggedBy: "Priya Raman",   loggedAt: "2026-02-11T11:00:00Z" },
];

export type Channel = "seo" | "email" | "paid" | "social" | "partner";

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: "live" | "scheduled" | "paused" | "ended";
  owner: string;
  budgetCents: number;
  spentCents: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startedAt: string; // ISO
}

export const campaigns: Campaign[] = [
  { id: "c1", name: "Q2 Growth — Ops Hub launch",        channel: "paid",    status: "live",      owner: "Ava Chen",     budgetCents: 1_200_000, spentCents:  812_400, impressions: 412_800, clicks: 18_420, conversions: 612, startedAt: "2026-03-18" },
  { id: "c2", name: "SEO cluster: agent workflows",      channel: "seo",     status: "live",      owner: "Noah Park",    budgetCents:   400_000, spentCents:  220_000, impressions: 268_100, clicks:  9_850, conversions: 441, startedAt: "2026-02-04" },
  { id: "c3", name: "Lifecycle nurture v4",              channel: "email",   status: "live",      owner: "Priya Raman",  budgetCents:   180_000, spentCents:   96_300, impressions:  54_200, clicks:  7_140, conversions: 389, startedAt: "2026-03-01" },
  { id: "c4", name: "LinkedIn founder series",           channel: "social",  status: "live",      owner: "Marcus King",  budgetCents:   250_000, spentCents:  134_900, impressions: 186_500, clicks:  6_220, conversions: 141, startedAt: "2026-03-10" },
  { id: "c5", name: "Partner co-marketing — Stripe",     channel: "partner", status: "scheduled", owner: "Ava Chen",     budgetCents:   500_000, spentCents:        0, impressions:       0, clicks:      0, conversions:   0, startedAt: "2026-05-02" },
  { id: "c6", name: "Retargeting — pricing page",        channel: "paid",    status: "live",      owner: "Noah Park",    budgetCents:   300_000, spentCents:  241_100, impressions: 142_700, clicks:  4_980, conversions: 198, startedAt: "2026-02-20" },
  { id: "c7", name: "Webinar: Measuring AI ROI",         channel: "email",   status: "ended",     owner: "Priya Raman",  budgetCents:   120_000, spentCents:  118_700, impressions:  38_900, clicks:  5_110, conversions: 262, startedAt: "2026-01-14" },
  { id: "c8", name: "Community push: r/devtools",        channel: "social",  status: "paused",    owner: "Marcus King",  budgetCents:    80_000, spentCents:   44_200, impressions:  72_300, clicks:  2_140, conversions:  48, startedAt: "2026-02-28" },
];

export interface ContentAsset {
  id: string;
  title: string;
  type: "Blog" | "Guide" | "Landing page" | "Case study" | "Email" | "Social";
  status: "brief" | "drafting" | "review" | "scheduled" | "published";
  owner: string;
  campaignId: string | null;
  wordCount: number;
  updatedAt: string;
  publishAt: string | null;
}

export const contentAssets: ContentAsset[] = [
  { id: "p1", title: "The operator's guide to AI-assisted SaaS ops", type: "Guide",        status: "published", owner: "Ava Chen",    campaignId: "c2", wordCount: 3_120, updatedAt: "2026-04-02", publishAt: "2026-03-28" },
  { id: "p2", title: "Why we rebuilt our billing engine from scratch", type: "Blog",       status: "published", owner: "Noah Park",   campaignId: "c1", wordCount: 1_840, updatedAt: "2026-04-08", publishAt: "2026-04-05" },
  { id: "p3", title: "Launch page — SaaS Operations Hub v2",         type: "Landing page", status: "scheduled", owner: "Ava Chen",    campaignId: "c1", wordCount:   720, updatedAt: "2026-04-14", publishAt: "2026-04-22" },
  { id: "p4", title: "Case study: Acme cut churn 28% in 6 weeks",    type: "Case study",   status: "review",    owner: "Priya Raman", campaignId: "c3", wordCount: 1_210, updatedAt: "2026-04-15", publishAt: null },
  { id: "p5", title: "Lifecycle nurture — email 3 (activation push)", type: "Email",       status: "drafting",  owner: "Priya Raman", campaignId: "c3", wordCount:   380, updatedAt: "2026-04-17", publishAt: null },
  { id: "p6", title: "Agent workflows — technical deep dive",        type: "Blog",         status: "drafting",  owner: "Noah Park",   campaignId: "c2", wordCount: 2_050, updatedAt: "2026-04-16", publishAt: null },
  { id: "p7", title: "Founder series 06 — pricing tension",          type: "Social",       status: "brief",     owner: "Marcus King", campaignId: "c4", wordCount:   160, updatedAt: "2026-04-17", publishAt: null },
  { id: "p8", title: "Integration guide — Stripe + Ops Hub",         type: "Guide",        status: "brief",     owner: "Ava Chen",    campaignId: "c5", wordCount:     0, updatedAt: "2026-04-12", publishAt: null },
];

export interface KeywordGroup {
  id: string;
  cluster: string;
  topKeyword: string;
  avgPosition: number;
  prevPosition: number;
  monthlyTraffic: number;
  trendPct: number;
  difficulty: "low" | "medium" | "high";
  tasks: number;
}

export const keywordGroups: KeywordGroup[] = [
  { id: "k1", cluster: "saas ops hub",          topKeyword: "saas operations hub",        avgPosition:  3.2, prevPosition:  5.1, monthlyTraffic: 8_420, trendPct:  18.2, difficulty: "medium", tasks: 2 },
  { id: "k2", cluster: "ai agent workflows",    topKeyword: "ai agent workflow tools",    avgPosition:  4.8, prevPosition:  6.4, monthlyTraffic: 6_180, trendPct:  22.7, difficulty: "high",   tasks: 3 },
  { id: "k3", cluster: "billing automation",    topKeyword: "stripe dunning automation",  avgPosition:  7.1, prevPosition:  7.3, monthlyTraffic: 2_940, trendPct:   1.2, difficulty: "medium", tasks: 1 },
  { id: "k4", cluster: "content generation",    topKeyword: "ai content workspace",       avgPosition:  5.4, prevPosition:  4.9, monthlyTraffic: 3_710, trendPct:  -4.8, difficulty: "high",   tasks: 4 },
  { id: "k5", cluster: "lead scoring",          topKeyword: "pql lead scoring model",     avgPosition:  9.6, prevPosition: 12.1, monthlyTraffic: 1_640, trendPct:  15.9, difficulty: "medium", tasks: 2 },
  { id: "k6", cluster: "multi-tenant saas",     topKeyword: "multi tenant saas patterns", avgPosition: 11.4, prevPosition: 10.8, monthlyTraffic:   980, trendPct:  -6.5, difficulty: "high",   tasks: 1 },
  { id: "k7", cluster: "product analytics",     topKeyword: "self serve analytics saas",  avgPosition:  6.2, prevPosition:  8.0, monthlyTraffic: 2_210, trendPct:  11.4, difficulty: "medium", tasks: 2 },
];

export interface SeoTask {
  id: string;
  page: string;
  issue: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "done";
}

export const seoTasks: SeoTask[] = [
  { id: "t1", page: "/pricing",                          issue: "Thin H1; rewrite around 'ops hub pricing'", priority: "high",   status: "in_progress" },
  { id: "t2", page: "/guides/agent-workflows",           issue: "Add FAQ schema + author block",              priority: "medium", status: "open" },
  { id: "t3", page: "/blog/billing-rebuild",             issue: "Compress hero image (1.8MB → <300KB)",        priority: "high",   status: "open" },
  { id: "t4", page: "/showcase/content-generator",       issue: "Add internal links from 3 blog posts",        priority: "medium", status: "done" },
  { id: "t5", page: "/",                                 issue: "Canonical tag conflict w/ portal.asafarim.com",         priority: "high",   status: "in_progress" },
  { id: "t6", page: "/guides/pql-scoring",               issue: "Publish target date (stuck in review)",        priority: "low",    status: "open" },
];

export interface Lead {
  id: string;
  name: string;
  company: string;
  source: "seo" | "email" | "paid" | "social" | "partner" | "direct";
  stage: "new" | "mql" | "sql" | "won" | "lost";
  score: number;
  createdAt: string;
}

export const leads: Lead[] = [
  { id: "l1",  name: "Sam Whitaker",  company: "Ridgefield Labs",   source: "seo",    stage: "sql",  score: 82, createdAt: "2026-04-17T08:14:00Z" },
  { id: "l2",  name: "Elena Moretti", company: "Nordwind Systems",  source: "paid",   stage: "mql",  score: 68, createdAt: "2026-04-17T09:40:00Z" },
  { id: "l3",  name: "Daniel Okafor", company: "Paulson & Hartley", source: "email",  stage: "new",  score: 41, createdAt: "2026-04-17T11:02:00Z" },
  { id: "l4",  name: "Mei Tanaka",    company: "Kitsune Analytics", source: "seo",    stage: "mql",  score: 71, createdAt: "2026-04-16T15:30:00Z" },
  { id: "l5",  name: "Jonas Keller",  company: "Blauwald GmbH",     source: "partner",stage: "won",  score: 94, createdAt: "2026-04-14T10:22:00Z" },
  { id: "l6",  name: "Rahul Desai",   company: "Chroma Ops",        source: "social", stage: "new",  score: 36, createdAt: "2026-04-17T07:18:00Z" },
  { id: "l7",  name: "Fatima Al-Jabri",company:"Seha Health",       source: "seo",    stage: "sql",  score: 78, createdAt: "2026-04-15T14:11:00Z" },
  { id: "l8",  name: "Owen Brennan",  company: "Lighthouse Retail", source: "paid",   stage: "lost", score: 22, createdAt: "2026-04-12T09:47:00Z" },
  { id: "l9",  name: "Yuki Saito",    company: "Kaiyo Energy",      source: "direct", stage: "mql",  score: 65, createdAt: "2026-04-16T12:05:00Z" },
  { id: "l10", name: "Laura Bianchi", company: "Pianura Logistics", source: "seo",    stage: "new",  score: 48, createdAt: "2026-04-17T06:51:00Z" },
];

export interface Automation {
  id: string;
  name: string;
  category: "nurture" | "routing" | "publishing" | "reporting";
  status: "healthy" | "warning" | "failed";
  description: string;
  lastRunAt: string;
  runs24h: number;
  successRate: number;
}

export const automations: Automation[] = [
  { id: "a1", name: "Welcome nurture — 6 emails",          category: "nurture",    status: "healthy", description: "Day 0 / 1 / 3 / 7 / 14 / 21 lifecycle emails triggered on new signup.", lastRunAt: "2026-04-17T14:02:00Z", runs24h: 214, successRate: 0.994 },
  { id: "a2", name: "Lead routing — round-robin AE",       category: "routing",    status: "healthy", description: "Route MQLs to available AE based on region + book balance.",           lastRunAt: "2026-04-17T14:18:00Z", runs24h:  86, successRate: 1.000 },
  { id: "a3", name: "Blog publish + cross-post",            category: "publishing", status: "warning", description: "On publish, syndicate to LinkedIn, X, Dev.to. Dev.to API slow today.",    lastRunAt: "2026-04-17T12:44:00Z", runs24h:   7, successRate: 0.714 },
  { id: "a4", name: "Weekly exec summary",                  category: "reporting",  status: "healthy", description: "Monday 08:00 Europe/Brussels — KPI digest to leadership list.",           lastRunAt: "2026-04-14T06:00:00Z", runs24h:   0, successRate: 1.000 },
  { id: "a5", name: "Churn-risk → CSM Slack",               category: "routing",    status: "healthy", description: "Ops Hub churn_risk event → Slack #csm-alerts with tenant context.",       lastRunAt: "2026-04-17T13:21:00Z", runs24h:  12, successRate: 1.000 },
  { id: "a6", name: "SEO rank drift alert",                 category: "reporting",  status: "failed",  description: "Detect >3 position drop on tracked keywords. Last run: Search Console 503.", lastRunAt: "2026-04-17T09:00:00Z", runs24h:   0, successRate: 0.000 },
  { id: "a7", name: "Lifecycle re-engagement (90d dormant)", category: "nurture",   status: "healthy", description: "Sends a targeted re-activation email to dormant signed-up users.",        lastRunAt: "2026-04-17T02:00:00Z", runs24h:  38, successRate: 0.973 },
];

export interface ActivityEvent {
  id: string;
  kind: "campaign" | "content" | "lead" | "seo" | "automation";
  title: string;
  detail: string;
  at: string;
}

export const recentActivity: ActivityEvent[] = [
  { id: "e1", kind: "lead",       title: "New SQL — Ridgefield Labs",           detail: "Sam Whitaker booked a demo from the Ops Hub landing page.", at: "2026-04-17T14:02:00Z" },
  { id: "e2", kind: "content",    title: "Blog scheduled — 'Ops Hub v2'",        detail: "Ava scheduled the launch post for 2026-04-22 08:00 UTC.",   at: "2026-04-17T13:41:00Z" },
  { id: "e3", kind: "automation", title: "Rank drift alert failed",              detail: "Search Console returned 503. Retry in 30m.",               at: "2026-04-17T09:00:00Z" },
  { id: "e4", kind: "seo",        title: "Keyword jump: 'agent workflows'",      detail: "Average position 6.4 → 4.8 (+1.6 ranks).",                 at: "2026-04-16T22:14:00Z" },
  { id: "e5", kind: "campaign",   title: "Paid campaign paused — r/devtools",    detail: "CPA rose above threshold ($84 vs $45 target).",            at: "2026-04-16T18:08:00Z" },
  { id: "e6", kind: "content",    title: "Case study approved",                  detail: "Priya approved the Acme churn case study for publish.",    at: "2026-04-16T16:20:00Z" },
];

export const funnel = {
  visitors: 184_300,
  signups: 4_120,
  mqls: 862,
  sqls: 318,
  won: 74,
};

export const analyticsWeekly = [
  { week: "W11", visitors: 38_420, signups: 842, mqls: 174, sqls:  58, revenueCents: 41_200_00 },
  { week: "W12", visitors: 41_180, signups: 908, mqls: 196, sqls:  66, revenueCents: 47_800_00 },
  { week: "W13", visitors: 39_540, signups: 879, mqls: 182, sqls:  61, revenueCents: 44_100_00 },
  { week: "W14", visitors: 44_720, signups: 951, mqls: 211, sqls:  71, revenueCents: 52_900_00 },
  { week: "W15", visitors: 46_880, signups: 990, mqls: 224, sqls:  77, revenueCents: 56_400_00 },
  { week: "W16", visitors: 48_560, signups: 1_038, mqls: 238, sqls: 82, revenueCents: 61_100_00 },
];

export const channelBreakdown = [
  { channel: "seo",     visitors: 62_400, signups: 1_480, mqls: 312, revenueCents: 24_800_00 },
  { channel: "paid",    visitors: 51_200, signups: 1_210, mqls: 244, revenueCents: 19_200_00 },
  { channel: "email",   visitors: 28_700, signups:   720, mqls: 168, revenueCents: 11_400_00 },
  { channel: "social",  visitors: 26_100, signups:   510, mqls:  98, revenueCents:  6_200_00 },
  { channel: "partner", visitors: 15_900, signups:   200, mqls:  40, revenueCents:  9_800_00 },
];
