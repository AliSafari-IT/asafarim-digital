import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Default Permissions ─────────────────────────────────────

const defaultPermissions = [
  // Users
  { name: "users.list", displayName: "List Users", group: "users", description: "View the list of users" },
  { name: "users.view", displayName: "View User", group: "users", description: "View user details" },
  { name: "users.edit", displayName: "Edit User", group: "users", description: "Edit user fields" },
  { name: "users.deactivate", displayName: "Deactivate User", group: "users", description: "Activate or deactivate users" },
  // Roles
  { name: "roles.list", displayName: "List Roles", group: "roles", description: "View the list of roles" },
  { name: "roles.view", displayName: "View Role", group: "roles", description: "View role details and permissions" },
  { name: "roles.edit", displayName: "Edit Role", group: "roles", description: "Create, edit, or delete roles" },
  { name: "roles.assign", displayName: "Assign Role", group: "roles", description: "Assign or remove roles from users" },
  // Content
  { name: "content.list", displayName: "List Content", group: "content", description: "View the list of content sections" },
  { name: "content.view", displayName: "View Content", group: "content", description: "View content details" },
  { name: "content.create", displayName: "Create Content", group: "content", description: "Create new content sections" },
  { name: "content.edit", displayName: "Edit Content", group: "content", description: "Edit content sections" },
  { name: "content.delete", displayName: "Delete Content", group: "content", description: "Delete content sections" },
  { name: "content.publish", displayName: "Publish Content", group: "content", description: "Publish or unpublish content" },
  // Navigation
  { name: "navigation.list", displayName: "List Navigation", group: "navigation", description: "View navigation items" },
  { name: "navigation.view", displayName: "View Navigation", group: "navigation", description: "View navigation item details" },
  { name: "navigation.edit", displayName: "Edit Navigation", group: "navigation", description: "Create, edit, or delete navigation items" },
  // Settings
  { name: "settings.list", displayName: "List Settings", group: "settings", description: "View site settings" },
  { name: "settings.view", displayName: "View Settings", group: "settings", description: "View setting details" },
  { name: "settings.edit", displayName: "Edit Settings", group: "settings", description: "Modify site settings" },
  // Audit
  { name: "audit.view", displayName: "View Audit Log", group: "audit", description: "View the audit log" },
  // Profile
  { name: "profile.edit", displayName: "Edit Own Profile", group: "profile", description: "Edit own profile details" },
  // Ops Hub
  { name: "ops.overview", displayName: "View Ops Overview", group: "ops", description: "View the ops hub KPI dashboard" },
  { name: "ops.tenants.view", displayName: "View Tenants", group: "ops", description: "List and inspect tenants" },
  { name: "ops.tenants.manage", displayName: "Manage Tenants", group: "ops", description: "Change tenant plan, status, seats" },
  { name: "ops.billing.view", displayName: "View Billing", group: "ops", description: "View subscriptions and invoices" },
  { name: "ops.billing.manage", displayName: "Manage Billing", group: "ops", description: "Edit subscriptions, refund, retry" },
  { name: "ops.flags.view", displayName: "View Feature Flags", group: "ops", description: "View feature flags and overrides" },
  { name: "ops.flags.manage", displayName: "Manage Feature Flags", group: "ops", description: "Toggle flags and create overrides" },
  { name: "ops.lifecycle.view", displayName: "View Lifecycle", group: "ops", description: "View lifecycle events timeline" },
  { name: "ops.automations.view", displayName: "View Automations", group: "ops", description: "List ops automations and runs" },
  { name: "ops.automations.manage", displayName: "Manage Automations", group: "ops", description: "Enable/disable automations" },
];

// ─── Default Roles ───────────────────────────────────────────

const defaultRoles = [
  {
    name: "superadmin",
    displayName: "Super Admin",
    description: "Full system access. Bypasses all permission checks.",
    isSystem: true,
    isDefault: false,
    permissions: defaultPermissions.map((p) => p.name),
  },
  {
    name: "admin",
    displayName: "Admin",
    description: "Administrative access with configurable permissions.",
    isSystem: true,
    isDefault: false,
    permissions: [
      "users.list", "users.view", "users.edit", "users.deactivate",
      "roles.list", "roles.view", "roles.edit", "roles.assign",
      "content.list", "content.view", "content.create", "content.edit", "content.delete", "content.publish",
      "navigation.list", "navigation.view", "navigation.edit",
      "settings.list", "settings.view", "settings.edit",
      "audit.view",
      "profile.edit",
    ],
  },
  {
    name: "standard_user",
    displayName: "Standard User",
    description: "Authenticated user with profile editing and content viewing.",
    isSystem: true,
    isDefault: false,
    permissions: ["profile.edit", "content.view"],
  },
  {
    name: "ops_admin",
    displayName: "Ops Admin",
    description: "Full access to the SaaS Operations Hub.",
    isSystem: true,
    isDefault: false,
    permissions: [
      "ops.overview",
      "ops.tenants.view", "ops.tenants.manage",
      "ops.billing.view", "ops.billing.manage",
      "ops.flags.view", "ops.flags.manage",
      "ops.lifecycle.view",
      "ops.automations.view", "ops.automations.manage",
      "audit.view", "users.list", "users.view",
      "profile.edit",
    ],
  },
  {
    name: "ops_viewer",
    displayName: "Ops Viewer",
    description: "Read-only access to the SaaS Operations Hub.",
    isSystem: true,
    isDefault: false,
    permissions: [
      "ops.overview",
      "ops.tenants.view",
      "ops.billing.view",
      "ops.flags.view",
      "ops.lifecycle.view",
      "ops.automations.view",
      "audit.view",
      "profile.edit",
    ],
  },
  {
    name: "guest",
    displayName: "Guest",
    description: "Default role for new users. Read-only access to public content.",
    isSystem: true,
    isDefault: true,
    permissions: ["content.view"],
  },
];

// ─── Default Nav Items ───────────────────────────────────────

const defaultNavItems = [
  { label: "Capabilities", href: "/#capabilities", position: 0, group: "main", visibility: "public" },
  { label: "Work", href: "/#showcase", position: 1, group: "main", visibility: "public" },
  { label: "Process", href: "/#process", position: 2, group: "main", visibility: "public" },
  { label: "Stack", href: "/#stack", position: 3, group: "main", visibility: "public" },
  { label: "Contact", href: "/#contact", position: 4, group: "main", visibility: "public" },
  { label: "Profile", href: "/profile", position: 5, group: "main", visibility: "authenticated" },
  { label: "Admin", href: "/admin", position: 6, group: "main", visibility: "role", requiredRole: "admin" },
];

// ─── Default Site Content ────────────────────────────────────

const defaultSiteContent = [
  {
    section: "hero",
    title: "Ship full-stack SaaS with AI at the core.",
    subtitle: "One partner for interface, architecture, and intelligent workflows. Premium UX, durable backends, and AI wired into real products.",
    eyebrow: "Frontend · Backend · AI",
    position: 0,
    body: {
      ctaPrimary: { label: "Start a build conversation", href: "#contact" },
      ctaSecondary: { label: "Review selected work", href: "#showcase" },
      proofPoints: [
        { value: "4-12", label: "week delivery window for MVP-to-v1 builds" },
        { value: "3 layers", label: "frontend, backend, and AI workflow ownership" },
        { value: "1 partner", label: "strategy, implementation, and launch support" },
      ],
    },
    metadata: {
      deliverySnapshot: {
        title: "Architecture that sells and scales",
        badge: "Shipping now",
        projectModel: "Single-owner execution",
        cards: [
          { label: "Frontend", text: "Intentional layout, motion, and content hierarchy" },
          { label: "Backend", text: "Auth, data models, APIs, queues, and maintainable service seams" },
        ],
        codePreview: `export const productSystem = {\n  frontend: ["Next.js", "TypeScript", "Design systems"],\n  backend: ["Node.js", ".NET", "PostgreSQL"],\n  intelligence: ["Agents", "RAG", "Automation"],\n  outcome: "launch-ready SaaS with operational depth"\n};`,
      },
    },
  },
  {
    section: "capabilities",
    title: "The site now needs to prove expertise, not just mention it.",
    subtitle: "The strongest signal for your business is not a long tool list. It is showing that you can shape product experience, data architecture, and automation as one coherent system.",
    eyebrow: "Capabilities",
    position: 1,
    body: {
      tracks: [
        {
          title: "Frontend Systems",
          eyebrow: "Interface quality",
          description: "Design-forward product interfaces with structured information flow, polished interactions, and conversion-aware UX.",
          points: ["Next.js App Router", "Design systems", "Product landing pages", "Dashboard UX"],
        },
        {
          title: "Backend Platforms",
          eyebrow: "Architecture depth",
          description: "Service boundaries, data modeling, secure auth flows, observability, and delivery patterns that hold up after launch.",
          points: ["TypeScript APIs", "C#/.NET services", "PostgreSQL", "Queues + automation"],
        },
        {
          title: "AI Product Layers",
          eyebrow: "Applied intelligence",
          description: "Production-focused agent flows, retrieval pipelines, and operational tooling that support real teams instead of demos.",
          points: ["RAG pipelines", "Tool-enabled agents", "Workflow orchestration", "Content automation"],
        },
      ],
    },
  },
  {
    section: "showcase",
    title: "Products that connect UX ambition to system design",
    subtitle: "These cards are positioned as product systems, not generic portfolio tiles. That reads as more senior and more credible.",
    eyebrow: "Selected Work",
    position: 2,
    body: {
      items: [
        {
          name: "Content Generator",
          label: "Live product",
          type: "AI writing workspace",
          summary: "Prompt-driven content production with clean UI states, reusable generation flows, and an application shell ready for expansion.",
          href: "/showcase/content-generator",
          cta: "Open app",
          isLive: true,
        },
        {
          name: "SaaS Operations Hub",
          label: "Live SaaS tool",
          type: "Admin analytics + lifecycle controls",
          summary: "Billing, feature access, metrics, and workflow controls designed as one operator surface rather than disconnected tools.",
          href: "/showcase/ops-hub",
          cta: "View live",
          isLive: true,
        },
        {
          name: "Marketing + Content Engine",
          label: "Growth system",
          type: "Website, SEO, and lead automation",
          summary: "A conversion-oriented marketing system combining front-end polish, structured content, and automated acquisition workflows.",
          href: "/showcase/marketing-content",
          cta: "View live",
          isLive: true,
        },
      ],
    },
  },
  {
    section: "process",
    title: "Hands-on from product framing to deployment",
    subtitle: "You are selling senior execution. The layout now emphasizes judgment, sequencing, and ownership instead of just listing services.",
    eyebrow: "Working Style",
    position: 3,
    body: {
      phases: [
        { step: "01", title: "Strategy + scoping", summary: "Define the revenue path, product surface, system boundaries, and delivery constraints before code expands." },
        { step: "02", title: "Interface + architecture", summary: "Shape the product experience and data flow together so the UI and backend reinforce each other." },
        { step: "03", title: "Build + operationalize", summary: "Ship the app, instrument it, and leave behind a maintainable platform instead of a fragile launch artifact." },
      ],
    },
  },
  {
    section: "stack",
    title: "Depth across interface, infrastructure, and AI delivery",
    eyebrow: "Technology Stack",
    position: 4,
    body: {
      groups: [
        { title: "Frontend", items: ["Next.js App Router", "TypeScript", "Tailwind CSS", "Conversion-focused UI systems"] },
        { title: "Backend", items: ["Node.js services", "C# / .NET microservices", "PostgreSQL", "Authentication + multi-tenant patterns"] },
        { title: "AI + Ops", items: ["RAG pipelines", "Agent orchestration", "Workflow automation", "Operational tooling"] },
      ],
    },
  },
  {
    section: "about",
    title: "I work at the intersection of product taste and engineering discipline.",
    subtitle: "My focus is building software that helps a business move: clearer positioning, cleaner interfaces, stronger backend foundations, and automation that reduces manual load. That balance is what makes a solo technical partner valuable.",
    eyebrow: "About",
    position: 5,
  },
  {
    section: "contact",
    title: "Need a serious technical partner for your next SaaS product?",
    subtitle: "Let's scope the product, architecture, and build sequence with the end-state in mind from day one.",
    eyebrow: "Contact",
    position: 6,
    body: {
      email: "info@asafarim.com",
      ctas: [
        { label: "Copy email address", action: "copy_email" },
        { label: "Open mail client", href: "mailto:info@asafarim.com" },
        { label: "View monorepo", href: "https://github.com/AliSafari-IT/asafarim-digital" },
      ],
    },
  },
];

// ─── Default Site Settings ───────────────────────────────────

const defaultSiteSettings = [
  { key: "brand.name", value: "ASafariM Digital", group: "brand", displayName: "Brand Name", description: "Primary brand name displayed across the portal" },
  { key: "brand.tagline", value: "Product engineering for AI-native SaaS", group: "brand", displayName: "Brand Tagline", description: "Tagline shown in the header" },
  { key: "brand.logo_initials", value: "AD", group: "brand", displayName: "Logo Initials", description: "Initials displayed in the logo badge" },
  { key: "contact.email", value: "info@asafarim.com", group: "contact", displayName: "Contact Email", description: "Primary contact email address" },
  { key: "contact.github", value: "https://github.com/AliSafari-IT/asafarim-digital", group: "contact", displayName: "GitHub URL", description: "GitHub repository URL" },
  { key: "footer.copyright", value: "ASafariM Digital", group: "footer", displayName: "Footer Copyright", description: "Copyright text in footer" },
  { key: "footer.subtitle", value: "Premium SaaS delivery across frontend, backend, and AI systems", group: "footer", displayName: "Footer Subtitle", description: "Subtitle in the footer" },
];

// ─── SaaS Ops Hub demo data ──────────────────────────────────

const demoPlans = [
  { code: "free", name: "Free", priceCents: 0, seatLimit: 2, sortOrder: 0, features: ["basic_analytics"] },
  { code: "starter", name: "Starter", priceCents: 4900, seatLimit: 10, sortOrder: 1, features: ["basic_analytics", "email_support"] },
  { code: "pro", name: "Pro", priceCents: 19900, seatLimit: 50, sortOrder: 2, features: ["basic_analytics", "advanced_analytics", "sso", "priority_support"] },
  { code: "enterprise", name: "Enterprise", priceCents: 99900, seatLimit: null as number | null, sortOrder: 3, features: ["basic_analytics", "advanced_analytics", "sso", "priority_support", "audit_export", "custom_roles", "sandbox"] },
];

const demoFlags = [
  { code: "basic_analytics", name: "Basic Analytics", category: "general", description: "Standard usage dashboards for all tenants.", defaultEnabled: true, rolloutPercent: 100 },
  { code: "advanced_analytics", name: "Advanced Analytics", category: "general", description: "Cohort analysis, retention, funnel breakdowns.", defaultEnabled: false, rolloutPercent: 40 },
  { code: "sso", name: "Single Sign-On", category: "general", description: "SAML / OIDC SSO for enterprise identity providers.", defaultEnabled: false, rolloutPercent: 20 },
  { code: "priority_support", name: "Priority Support", category: "general", description: "Guaranteed first-response SLA.", defaultEnabled: false, rolloutPercent: 15 },
  { code: "audit_export", name: "Audit Export", category: "general", description: "Export audit log as CSV/JSON.", defaultEnabled: false, rolloutPercent: 10 },
  { code: "custom_roles", name: "Custom Roles", category: "general", description: "Tenant-defined RBAC roles.", defaultEnabled: false, rolloutPercent: 5 },
  { code: "sandbox", name: "Sandbox Environment", category: "beta", description: "Isolated tenant sandbox for testing integrations.", defaultEnabled: false, rolloutPercent: 8 },
  { code: "ai_copilot", name: "AI Copilot", category: "experimental", description: "In-product AI assistant. Early access only.", defaultEnabled: false, rolloutPercent: 3 },
  { code: "new_billing_engine", name: "New Billing Engine", category: "beta", description: "Migrating from legacy billing pipeline.", defaultEnabled: false, rolloutPercent: 25 },
  { code: "legacy_api_v1", name: "Legacy API v1", category: "killswitch", description: "Master switch to deprecate the old public API.", defaultEnabled: true, rolloutPercent: 100 },
];

const demoTenants = [
  { slug: "acme-corp", name: "Acme Corp", plan: "enterprise", status: "active", seats: 42, region: "EU", industry: "Manufacturing", monthsActive: 18 },
  { slug: "northwind", name: "Northwind Traders", plan: "pro", status: "active", seats: 18, region: "EU", industry: "Logistics", monthsActive: 12 },
  { slug: "contoso-labs", name: "Contoso Labs", plan: "pro", status: "active", seats: 24, region: "US", industry: "SaaS", monthsActive: 9 },
  { slug: "fabrikam", name: "Fabrikam Inc", plan: "starter", status: "past_due", seats: 8, region: "US", industry: "Retail", monthsActive: 6 },
  { slug: "initech", name: "Initech Holdings", plan: "starter", status: "trial", seats: 3, region: "EU", industry: "Finance", monthsActive: 0 },
  { slug: "umbrella", name: "Umbrella Research", plan: "enterprise", status: "active", seats: 85, region: "EU", industry: "Pharma", monthsActive: 24 },
  { slug: "globex", name: "Globex Ventures", plan: "pro", status: "active", seats: 14, region: "US", industry: "Media", monthsActive: 4 },
  { slug: "hooli", name: "Hooli GmbH", plan: "starter", status: "churned", seats: 5, region: "EU", industry: "Tech", monthsActive: 3 },
  { slug: "wayne-enterprises", name: "Wayne Enterprises", plan: "enterprise", status: "active", seats: 120, region: "US", industry: "Conglomerate", monthsActive: 36 },
  { slug: "stark-industries", name: "Stark Industries", plan: "pro", status: "active", seats: 32, region: "US", industry: "Aerospace", monthsActive: 15 },
  { slug: "soylent", name: "Soylent Biotech", plan: "free", status: "active", seats: 2, region: "EU", industry: "Biotech", monthsActive: 2 },
  { slug: "cyberdyne", name: "Cyberdyne Systems", plan: "pro", status: "active", seats: 22, region: "US", industry: "AI/ML", monthsActive: 7 },
];

const demoAutomations = [
  { code: "churn_risk_alert", name: "Churn risk alert", trigger: "event", eventType: "tenant.churn_risk", action: "notify", description: "Post to #ops-alerts when a tenant shows churn signals (login drop, failed payment, NPS decline).", isEnabled: true, lastStatus: "success" },
  { code: "past_due_dunning", name: "Past-due dunning sequence", trigger: "schedule", schedule: "0 9 * * *", action: "email", description: "Daily email sequence to tenants with past_due invoices (day 1, 3, 7, 14).", isEnabled: true, lastStatus: "success" },
  { code: "trial_ending_nudge", name: "Trial-ending nudge", trigger: "schedule", schedule: "0 10 * * *", action: "email", description: "Email tenant primary contact 3 days before trial end with upgrade CTA.", isEnabled: true, lastStatus: "success" },
  { code: "expansion_candidate", name: "Expansion candidate flag", trigger: "schedule", schedule: "0 8 * * 1", action: "tag", description: "Weekly scan: tag tenants using >80% of seat cap as expansion candidates.", isEnabled: true, lastStatus: "success" },
  { code: "legacy_api_deprecation", name: "Legacy API deprecation notice", trigger: "event", eventType: "api.v1.call", action: "run_webhook", description: "Notify tenants still using Legacy API v1. Paused pending migration readiness.", isEnabled: false, lastStatus: "skipped" },
  { code: "new_signup_welcome", name: "New signup welcome", trigger: "event", eventType: "tenant.signup", action: "email", description: "Send product onboarding email 15 minutes after tenant signup.", isEnabled: true, lastStatus: "success" },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seedOpsHub() {
  console.log("  → Seeding Ops Hub plans...");
  const planMap: Record<string, string> = {};
  for (const p of demoPlans) {
    const plan = await prisma.plan.upsert({
      where: { code: p.code },
      update: { name: p.name, priceCents: p.priceCents, seatLimit: p.seatLimit, features: p.features, sortOrder: p.sortOrder },
      create: { code: p.code, name: p.name, priceCents: p.priceCents, seatLimit: p.seatLimit, features: p.features, sortOrder: p.sortOrder, currency: "USD", interval: "month", isActive: true },
    });
    planMap[p.code] = plan.id;
  }
  console.log(`    ✓ ${demoPlans.length} plans seeded`);

  console.log("  → Seeding feature flags...");
  const flagMap: Record<string, string> = {};
  for (const f of demoFlags) {
    const flag = await prisma.featureFlag.upsert({
      where: { code: f.code },
      update: { name: f.name, description: f.description, category: f.category, defaultEnabled: f.defaultEnabled, rolloutPercent: f.rolloutPercent },
      create: f,
    });
    flagMap[f.code] = flag.id;
  }
  console.log(`    ✓ ${demoFlags.length} feature flags seeded`);

  console.log("  → Seeding demo tenants and subscriptions...");
  for (const t of demoTenants) {
    const planId = planMap[t.plan];
    const planInfo = demoPlans.find((p) => p.code === t.plan)!;
    const mrr = planInfo.priceCents * (t.plan === "enterprise" ? Math.max(1, Math.floor(t.seats / 10)) : 1);

    const tenant = await prisma.tenant.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        plan: t.plan,
        status: t.status,
        seats: t.seats,
        region: t.region,
        industry: t.industry,
        mrrCents: mrr,
        trialEndsAt: t.status === "trial" ? daysAgo(-10) : null,
        churnedAt: t.status === "churned" ? daysAgo(20) : null,
      },
      create: {
        slug: t.slug,
        name: t.name,
        plan: t.plan,
        status: t.status,
        seats: t.seats,
        region: t.region,
        industry: t.industry,
        mrrCents: mrr,
        trialEndsAt: t.status === "trial" ? daysAgo(-10) : null,
        churnedAt: t.status === "churned" ? daysAgo(20) : null,
      },
    });

    // Subscription (skip for free + churned)
    if (t.plan !== "free" && t.status !== "churned") {
      const subStatus = t.status === "trial" ? "trialing" : t.status === "past_due" ? "past_due" : "active";
      const existing = await prisma.subscription.findFirst({ where: { tenantId: tenant.id } });
      const sub = existing
        ? await prisma.subscription.update({
            where: { id: existing.id },
            data: { planId, status: subStatus, seats: t.seats, mrrCents: mrr, renewsAt: daysAgo(-20) },
          })
        : await prisma.subscription.create({
            data: {
              tenantId: tenant.id,
              planId,
              status: subStatus,
              seats: t.seats,
              mrrCents: mrr,
              startedAt: daysAgo(30 * t.monthsActive),
              renewsAt: daysAgo(-20),
              trialEndsAt: t.status === "trial" ? daysAgo(-10) : null,
            },
          });

      // Invoices: generate up to 6 most recent monthly invoices
      const invoiceCount = Math.min(6, t.monthsActive);
      for (let i = 0; i < invoiceCount; i++) {
        const issued = daysAgo(30 * i + 5);
        const number = `INV-${t.slug.toUpperCase()}-${String(i + 1).padStart(4, "0")}`;
        const isLatestPastDue = i === 0 && t.status === "past_due";
        await prisma.invoice.upsert({
          where: { number },
          update: {},
          create: {
            subscriptionId: sub.id,
            number,
            amountCents: mrr,
            currency: "USD",
            status: isLatestPastDue ? "open" : "paid",
            issuedAt: issued,
            paidAt: isLatestPastDue ? null : new Date(issued.getTime() + 2 * 86400000),
          },
        });
      }
    }

    // Lifecycle events — seed a storyline
    const events: { kind: string; title: string; severity: string; details?: string; when: Date }[] = [];
    events.push({ kind: "signup", title: "Tenant signed up", severity: "info", when: daysAgo(30 * t.monthsActive + 1) });
    if (t.monthsActive > 0) events.push({ kind: "activated", title: "Activated within first 7 days", severity: "success", when: daysAgo(30 * t.monthsActive - 6) });
    if (t.plan === "pro" || t.plan === "enterprise") events.push({ kind: "upgraded", title: `Upgraded to ${t.plan}`, severity: "success", when: daysAgo(30 * Math.max(1, t.monthsActive - 2)) });
    if (t.status === "past_due") events.push({ kind: "churn_risk", title: "Payment failed — churn risk", severity: "warning", details: "Last invoice marked open. Dunning sequence active.", when: daysAgo(5) });
    if (t.status === "churned") events.push({ kind: "churned", title: "Tenant churned", severity: "danger", details: "Canceled after trial-to-paid conversion failure.", when: daysAgo(20) });
    if (t.seats >= 30) events.push({ kind: "expansion", title: `Expanded to ${t.seats} seats`, severity: "success", when: daysAgo(15) });
    if (t.slug === "stark-industries") events.push({ kind: "support_ticket", title: "High-severity support ticket opened", severity: "warning", details: "SSO login latency above SLA.", when: daysAgo(2) });

    for (const e of events) {
      const exists = await prisma.lifecycleEvent.findFirst({
        where: { tenantId: tenant.id, kind: e.kind, occurredAt: e.when },
      });
      if (!exists) {
        await prisma.lifecycleEvent.create({
          data: { tenantId: tenant.id, kind: e.kind, title: e.title, severity: e.severity, details: e.details, occurredAt: e.when },
        });
      }
    }

    // Usage metrics — last 6 weeks
    for (let w = 0; w < 6; w++) {
      const periodStart = daysAgo(w * 7 + 7);
      periodStart.setHours(0, 0, 0, 0);
      const growth = t.status === "churned" ? 0.3 : t.status === "past_due" ? 0.6 : 1 + (5 - w) * 0.05;
      const baseCalls = 1500 + t.seats * 120;
      await prisma.usageMetric.upsert({
        where: { tenantId_metric_periodStart: { tenantId: tenant.id, metric: "api_calls", periodStart } },
        update: { value: Math.round(baseCalls * growth) },
        create: { tenantId: tenant.id, metric: "api_calls", periodStart, value: Math.round(baseCalls * growth) },
      });
      await prisma.usageMetric.upsert({
        where: { tenantId_metric_periodStart: { tenantId: tenant.id, metric: "active_users", periodStart } },
        update: { value: Math.max(1, Math.round(t.seats * 0.7 * growth)) },
        create: { tenantId: tenant.id, metric: "active_users", periodStart, value: Math.max(1, Math.round(t.seats * 0.7 * growth)) },
      });
    }
  }
  console.log(`    ✓ ${demoTenants.length} tenants + subscriptions + invoices + lifecycle + usage seeded`);

  // Feature flag overrides — add a few realistic stories
  console.log("  → Seeding feature flag overrides...");
  const overridePlans: { tenant: string; flag: string; enabled: boolean; note?: string }[] = [
    { tenant: "acme-corp", flag: "sandbox", enabled: true, note: "Requested by account team for QA environment." },
    { tenant: "umbrella", flag: "ai_copilot", enabled: true, note: "Design partner for early access." },
    { tenant: "wayne-enterprises", flag: "ai_copilot", enabled: true, note: "Executive sponsor demo." },
    { tenant: "fabrikam", flag: "new_billing_engine", enabled: false, note: "Hold off until past-due is resolved." },
    { tenant: "contoso-labs", flag: "audit_export", enabled: true, note: "Compliance review in progress." },
    { tenant: "stark-industries", flag: "custom_roles", enabled: true, note: "Security review approved." },
  ];
  for (const o of overridePlans) {
    const tenant = await prisma.tenant.findUnique({ where: { slug: o.tenant } });
    const flagId = flagMap[o.flag];
    if (tenant && flagId) {
      await prisma.featureFlagOverride.upsert({
        where: { flagId_tenantId: { flagId, tenantId: tenant.id } },
        update: { enabled: o.enabled, note: o.note },
        create: { flagId, tenantId: tenant.id, enabled: o.enabled, note: o.note },
      });
    }
  }
  console.log(`    ✓ ${overridePlans.length} overrides seeded`);

  // Automations + runs
  console.log("  → Seeding automations and runs...");
  for (const a of demoAutomations) {
    const automation = await prisma.automation.upsert({
      where: { code: a.code },
      update: {
        name: a.name, description: a.description, trigger: a.trigger, schedule: a.schedule, eventType: a.eventType,
        action: a.action, isEnabled: a.isEnabled, lastStatus: a.lastStatus, lastRunAt: a.isEnabled ? daysAgo(0) : daysAgo(7),
      },
      create: {
        code: a.code, name: a.name, description: a.description, trigger: a.trigger, schedule: a.schedule, eventType: a.eventType,
        action: a.action, isEnabled: a.isEnabled, lastStatus: a.lastStatus, lastRunAt: a.isEnabled ? daysAgo(0) : daysAgo(7),
      },
    });
    // Add a handful of runs
    const runCount = a.isEnabled ? 5 : 2;
    for (let i = 0; i < runCount; i++) {
      const started = daysAgo(i);
      const existing = await prisma.automationRun.findFirst({
        where: { automationId: automation.id, startedAt: started },
      });
      if (!existing) {
        const status = i === 0 ? a.lastStatus ?? "success" : i === 1 && a.code === "past_due_dunning" ? "failed" : "success";
        await prisma.automationRun.create({
          data: {
            automationId: automation.id,
            status,
            output: status === "failed" ? "SMTP timeout; retrying on next tick." : `Processed ${3 + i} tenant(s).`,
            startedAt: started,
            completedAt: new Date(started.getTime() + 20_000),
          },
        });
      }
    }
  }
  console.log(`    ✓ ${demoAutomations.length} automations seeded with runs`);
}

// ─── Seed Runner ─────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Upsert permissions
  console.log("  → Seeding permissions...");
  const permissionMap: Record<string, string> = {};
  for (const p of defaultPermissions) {
    const result = await prisma.permission.upsert({
      where: { name: p.name },
      update: { displayName: p.displayName, group: p.group, description: p.description },
      create: p,
    });
    permissionMap[p.name] = result.id;
  }
  console.log(`    ✓ ${defaultPermissions.length} permissions seeded`);

  // 2. Upsert roles and connect permissions
  console.log("  → Seeding roles...");
  for (const r of defaultRoles) {
    const { permissions, ...roleData } = r;
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: roleData.displayName, description: roleData.description, isSystem: roleData.isSystem, isDefault: roleData.isDefault },
      create: roleData,
    });

    // Upsert role-permission connections
    for (const permName of permissions) {
      const permId = permissionMap[permName];
      if (permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permId } },
          update: {},
          create: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }
  console.log(`    ✓ ${defaultRoles.length} roles seeded`);

  // 3. Assign guest role to existing users that have no roles
  console.log("  → Assigning default role to existing users...");
  const guestRole = await prisma.role.findUnique({ where: { name: "guest" } });
  if (guestRole) {
    const usersWithoutRoles = await prisma.user.findMany({
      where: { userRoles: { none: {} } },
      select: { id: true },
    });
    for (const user of usersWithoutRoles) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: guestRole.id } },
        update: {},
        create: { userId: user.id, roleId: guestRole.id },
      });
    }
    console.log(`    ✓ ${usersWithoutRoles.length} users assigned guest role`);
  }

  // 4. Upsert nav items
  console.log("  → Seeding navigation items...");
  for (const nav of defaultNavItems) {
    const existing = await prisma.navItem.findFirst({
      where: { href: nav.href, group: nav.group },
    });
    if (!existing) {
      await prisma.navItem.create({ data: nav });
    }
  }
  console.log(`    ✓ Navigation items seeded`);

  // 5. Upsert site content
  console.log("  → Seeding site content...");
  for (const content of defaultSiteContent) {
    await prisma.siteContent.upsert({
      where: { section: content.section },
      update: {
        title: content.title,
        subtitle: content.subtitle,
        eyebrow: content.eyebrow,
        body: content.body ?? undefined,
        metadata: content.metadata ?? undefined,
        position: content.position,
      },
      create: {
        section: content.section,
        title: content.title,
        subtitle: content.subtitle ?? null,
        eyebrow: content.eyebrow ?? null,
        body: content.body ?? undefined,
        metadata: content.metadata ?? undefined,
        position: content.position,
        isPublished: true,
      },
    });
  }
  console.log(`    ✓ ${defaultSiteContent.length} content sections seeded`);

  // 6. Upsert site settings
  console.log("  → Seeding site settings...");
  for (const setting of defaultSiteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, group: setting.group, displayName: setting.displayName, description: setting.description },
      create: { key: setting.key, value: setting.value, group: setting.group, displayName: setting.displayName, description: setting.description },
    });
  }
  console.log(`    ✓ ${defaultSiteSettings.length} settings seeded`);

  // 7. Seed Ops Hub demo data
  await seedOpsHub();

  // 7b. Bootstrap superadmin(s) from SUPERADMIN_EMAILS env (comma-separated)
  const bootstrapEmails = (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (bootstrapEmails.length > 0) {
    console.log(`  → Bootstrapping superadmin role for: ${bootstrapEmails.join(", ")}`);
    const superadminRole = await prisma.role.findUnique({ where: { name: "superadmin" } });
    if (superadminRole) {
      for (const email of bootstrapEmails) {
        const user = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
          select: { id: true, email: true },
        });
        if (!user) {
          console.log(`    ⚠ no user found for ${email} (will apply next time they sign in)`);
          continue;
        }
        await prisma.userRole.upsert({
          where: { userId_roleId: { userId: user.id, roleId: superadminRole.id } },
          update: {},
          create: { userId: user.id, roleId: superadminRole.id },
        });
        console.log(`    ✓ superadmin granted to ${user.email}`);
      }
    }
  }

  // 8. Grant ops_admin role to superadmin users (so showcase works out of the box)
  console.log("  → Granting ops_admin to superadmin users...");
  const opsAdminRole = await prisma.role.findUnique({ where: { name: "ops_admin" } });
  const superadmins = await prisma.userRole.findMany({
    where: { role: { name: "superadmin" } },
    select: { userId: true },
  });
  if (opsAdminRole) {
    for (const sa of superadmins) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: sa.userId, roleId: opsAdminRole.id } },
        update: {},
        create: { userId: sa.userId, roleId: opsAdminRole.id },
      });
    }
    console.log(`    ✓ ops_admin granted to ${superadmins.length} superadmin user(s)`);
  }

  // 10. Seed App Registry
  console.log("  → Seeding app registry...");
  const defaultApps = [
    {
      code: "portal",
      name: "Portal",
      description: "Marketing site, authentication, CMS, and admin console.",
      url: process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal-qa.asafarim.com",
      healthUrl: (process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal-qa.asafarim.com") + "/api/health",
      environment: "qa",
    },
    {
      code: "content-generator",
      name: "Content Generator",
      description: "AI-powered content generation (OpenAI with Anthropic fallback).",
      url: process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL ?? "https://content-generator-qa.asafarim.com",
      healthUrl: (process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL ?? "https://content-generator-qa.asafarim.com") + "/api/health",
      environment: "qa",
    },
    {
      code: "ops-hub",
      name: "Ops Hub",
      description: "SaaS operations: tenants, billing, lifecycle, feature flags, automations.",
      url: process.env.NEXT_PUBLIC_OPS_HUB_URL ?? "https://ops-hub.asafarim.com",
      healthUrl: (process.env.NEXT_PUBLIC_OPS_HUB_URL ?? "https://ops-hub.asafarim.com") + "/api/health",
      environment: "qa",
    },
    {
      code: "marketing-content",
      name: "Marketing Content",
      description: "Campaigns, MQLs, growth dashboards, content calendar.",
      url: process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL ?? "https://marketing-content.asafarim.com",
      healthUrl: (process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL ?? "https://marketing-content.asafarim.com") + "/api/health",
      environment: "qa",
    },
  ];
  for (const app of defaultApps) {
    await prisma.appRegistry.upsert({
      where: { code: app.code },
      update: {
        name: app.name,
        description: app.description,
        url: app.url,
        healthUrl: app.healthUrl,
        environment: app.environment,
        isEnabled: true,
      },
      create: { ...app, isEnabled: true },
    });
  }
  console.log(`    ✓ ${defaultApps.length} apps registered`);

  // 11. Seed system content types for the content generator.
  console.log("  → Seeding system content types...");
  const systemContentTypes = [
    {
      slug: "blog",
      label: "Blog Post",
      description: "Long-form, educational, SEO-friendly",
      promptInstructions:
        "Produce an SEO-friendly long-form blog draft with a compelling intro, scannable subheadings, examples, and a conclusion with a clear takeaway.",
    },
    {
      slug: "product",
      label: "Product Description",
      description: "Benefit-focused product copy",
      promptInstructions:
        "Write benefit-led product copy. Emphasize outcomes for the buyer, differentiators, and a single clear CTA.",
    },
    {
      slug: "email",
      label: "Email",
      description: "Clear and persuasive outreach",
      promptInstructions:
        "Write a concise email with a hook, value proposition, social proof if relevant, and a single CTA. Avoid filler.",
    },
    {
      slug: "social",
      label: "Social Caption",
      description: "Short, punchy, high-engagement",
      promptInstructions:
        "Draft 3 platform-aware social captions. Tone: confident, practical, premium. Use line breaks for readability and 1-2 relevant hashtags max.",
    },
    {
      slug: "summary",
      label: "Summary",
      description: "Concise key points",
      promptInstructions:
        "Distill the input into the smallest set of high-signal bullet points capturing the key facts, decisions, and follow-ups.",
    },
  ];
  for (const def of systemContentTypes) {
    const existing = await prisma.contentTypeDefinition.findFirst({
      where: { slug: def.slug, isSystem: true, userId: null, tenantId: null },
    });
    if (existing) {
      await prisma.contentTypeDefinition.update({
        where: { id: existing.id },
        data: {
          label: def.label,
          description: def.description,
          promptInstructions: def.promptInstructions,
          isSystem: true,
          isActive: true,
        },
      });
    } else {
      await prisma.contentTypeDefinition.create({
        data: {
          slug: def.slug,
          label: def.label,
          description: def.description,
          promptInstructions: def.promptInstructions,
          isSystem: true,
          isActive: true,
        },
      });
    }
  }
  console.log(`    ✓ ${systemContentTypes.length} system content types ensured`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
