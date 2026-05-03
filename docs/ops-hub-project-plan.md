# Ops Hub Project Plan

**Author:** Ali Safari
**Created:** 2026-05-03
**Status:** Operator MVP complete, public onboarding and production hardening next
**Purpose:** Build a practical SaaS operations console for ASafariM Digital while
practicing tenant operations, RBAC, feature control, lifecycle intelligence,
automation monitoring, auditability, and business health workflows.

## 1. Vision

Ops Hub is the internal control room for a SaaS business. It should help an
operator answer five questions quickly:

1. Which tenants are healthy, stuck, at risk, or expanding?
2. Which subscriptions, invoices, and usage patterns need attention?
3. Which feature flags and automations are active, risky, or failing?
4. What changed recently, who changed it, and why?
5. What should the operator do next?

The app should feel focused, dense, and operational. It is not a generic admin
CRUD surface; it is a working console for repeated business operations.

## 2. Current Implementation Snapshot

Current app: `apps/ops-hub`

Implemented:

- Authenticated Next.js app using shared ASafariM auth.
- `ops_viewer`, `ops_admin`, and `superadmin` access model.
- KPI-first overview.
- Tenant directory and tenant detail pages.
- User directory.
- Billing view for subscriptions and invoices.
- Feature flag catalog with toggle mutations.
- Lifecycle timeline.
- Automation list and toggle mutations.
- Audit log for operator mutations.
- System health route and system page.
- Public health endpoint.
- Prisma models for tenants, plans, subscriptions, invoices, feature flags,
  feature flag overrides, lifecycle events, usage metrics, automations,
  automation runs, and audit logs.
- Seed data that creates realistic tenant, billing, usage, lifecycle, feature
  flag, automation, and audit scenarios.

Known gaps:

- Guest-facing product homepage is missing; direct visits redirect to sign-in.
- No Stripe subscription sync yet.
- No real alert destinations.
- No support desk, CRM, or product analytics integrations.
- No tenant health score beyond dashboard-level summaries.
- No saved views or custom dashboards.
- No operator playbooks.
- No notification routing or escalation logic.

## 3. Product Principles

- Put action above administration: every screen should help an operator decide
  what to inspect or do next.
- Keep read-only access safe by default.
- Audit every mutation that changes customer-facing or operational state.
- Show reasons and context, not only raw records.
- Prefer deterministic business rules before AI recommendations.
- Make integrations additive; the local seeded demo should remain useful.

## 4. Target Users

- Founder/operator monitoring customer health.
- Customer success lead triaging churn risk and expansion signals.
- Finance/admin user inspecting invoices and subscriptions.
- Product operator managing feature rollout and kill switches.
- Support or engineering lead checking automation failures and audit history.

## 5. Architecture

```text
Ops Hub UI (Next.js)
          |
          v
Ops Hub API routes
          |
          +-- shared auth/session via @asafarim/auth
          +-- RBAC checks in apps/ops-hub/lib/rbac.ts
          +-- Prisma/Postgres via @asafarim/db
          +-- audit logging in apps/ops-hub/lib/audit.ts
          +-- system health checks
          +-- seeded demo operational data
```

Future architecture additions:

- Stripe sync workers for subscriptions, invoices, plans, and payments.
- Alert dispatcher for Slack, email, and webhook destinations.
- Support/CRM ingestion jobs.
- Product analytics ingestion for usage and health scoring.
- Operator notification center.
- Playbook engine for repeated operational responses.

## 6. Data Model Direction

Existing concepts:

- Tenant: customer account with status, region, industry, MRR, seats, and trial
  lifecycle.
- Plan: subscription catalog and feature defaults.
- Subscription: tenant plan state, renewal, seats, and revenue.
- Invoice: billing state and payment history.
- Feature flag: global rollout control.
- Feature flag override: tenant-specific rollout exception.
- Lifecycle event: business and customer timeline.
- Usage metric: weekly usage rollups.
- Automation and automation run: scheduled/event-driven operational jobs.
- Audit log: append-only record of operator mutations.

Planned concepts:

- Tenant health score: deterministic score with reason breakdown.
- Risk signal: normalized churn, billing, usage, support, and lifecycle signals.
- Playbook: repeatable operator response with tasks and owner.
- Alert rule: condition, threshold, destination, and cooldown.
- Saved view: filtered table or dashboard configuration.
- Integration connection: Stripe, Slack, CRM, support desk, analytics provider.
- Operator note: manual context attached to tenants, invoices, or events.
- Incident: grouped automation failures or operational degradation.

## 7. Milestones

### Phase 0 - App Skeleton and Access Model (Complete)

Deliverables:

- Next.js app scaffold in `apps/ops-hub`.
- Shared auth integration.
- `ops_viewer`, `ops_admin`, and `superadmin` role model.
- Public health endpoint.
- Docker and deployment conventions.

### Phase 1 - Operator Data Foundation (Complete)

Deliverables:

- Prisma schema additions for tenants, plans, subscriptions, invoices, feature
  flags, overrides, lifecycle events, usage metrics, automations, automation
  runs, and audit logs.
- Seed script with realistic demo tenants and operational storylines.
- Formatting helpers and RBAC helpers.

### Phase 2 - Core Console MVP (Complete)

Deliverables:

- Overview page with KPI cards, risk queue, plan mix, and recent events.
- Tenant directory with filters.
- Tenant detail page with business, usage, billing, users, lifecycle, and flag
  context.
- Users, billing, feature flags, lifecycle, automations, and audit pages.
- API routes for overview, tenants, feature flags, automations, and audit.
- Audit logging for mutation routes.

### Phase 3 - Public Product Homepage (Next)

Goal: let guests understand Ops Hub before they hit the sign-in wall while
keeping the actual console protected.

Deliverables:

- Public guest homepage at `http://localhost:3003/`.
- Authenticated users with Ops Hub permissions continue into the console.
- Authenticated users without Ops Hub permissions see the restricted-access
  state.
- Public copy explaining tenants, billing, lifecycle, flags, automations, and
  audit history.
- CTA to portal sign-in/register preserving callback URL.
- Mobile-friendly public layout.

Acceptance criteria:

- Guest visit to `/` shows a public Ops Hub overview.
- No tenant, billing, user, feature flag, automation, or audit data is exposed.
- Sign-in returns authorized users to the Ops Hub console.

### Phase 4 - Stripe Billing Sync

Goal: move billing from seeded demo data toward real subscription operations.

Deliverables:

- Stripe customer/subscription/invoice mapping strategy.
- Sync job for plans, subscriptions, invoices, and payment state.
- Webhook handling for subscription and invoice lifecycle events.
- Billing reconciliation page showing last sync, source state, and local state.
- Manual resync action gated to `ops_admin`.
- Audit records for manual sync actions.

Acceptance criteria:

- Operators can see whether billing data is current.
- Subscription and invoice status changes are traceable to Stripe events.

### Phase 5 - Tenant Health Scoring

Goal: make risk and expansion signals explicit.

Deliverables:

- Deterministic health score with reason breakdown.
- Inputs from subscription state, invoice status, usage trend, lifecycle events,
  seat utilization, and support/automation signals.
- Health badge on overview, tenant list, and tenant detail.
- Risk queue sorted by severity and freshness.
- Expansion queue for high-usage or plan-limit tenants.
- Tests for scoring rules.

Creative milestone:

- "Why this tenant needs attention" summary that explains the score in plain
  operator language.

### Phase 6 - Alerts and Escalation

Goal: notify operators when business-critical state changes.

Deliverables:

- Alert rule model.
- Alert destinations for email, Slack/webhook, and in-app notification.
- Conditions for past-due invoice, churn-risk event, automation failure,
  sudden usage drop, trial ending, and feature flag incident.
- Cooldown and dedupe logic.
- Alert run history.
- Admin UI for enabling/disabling alert rules.

Acceptance criteria:

- Operators can trace why an alert fired and whether it was delivered.

### Phase 7 - Playbooks

Goal: turn repeated operations into guided workflows.

Deliverables:

- Playbook model with trigger, steps, owner, due date, and completion state.
- Built-in playbooks:
  - past-due recovery
  - churn risk outreach
  - trial conversion
  - enterprise expansion
  - failed automation follow-up
  - feature rollout verification
- Tenant detail playbook panel.
- Activity timeline entries when playbooks start/finish.
- Audit events for playbook actions.

Creative milestone:

- "Operator briefing" that summarizes active playbooks and next actions for the
  day.

### Phase 8 - Integrations

Goal: make Ops Hub reflect real operational systems.

Deliverables:

- Integration connection settings.
- Stripe as first production integration.
- Support desk ingestion plan for tickets and satisfaction signals.
- CRM ingestion plan for lifecycle and account-owner signals.
- Product analytics ingestion plan for usage metrics.
- Webhook receiver for custom events.
- Integration health dashboard.

Acceptance criteria:

- Operators can see whether each integration is connected, stale, failing, or
  healthy.

### Phase 9 - Saved Views and Custom Dashboards

Goal: let different operators keep the view they need.

Deliverables:

- Saved filters for tenants, billing, lifecycle, audit, and automations.
- Custom dashboard cards selected from available metrics.
- Role-aware defaults for founder, finance, customer success, product, and
  support views.
- Shareable saved views inside the tenant.
- URL-stable filter state.

### Phase 10 - Operational Intelligence

Goal: move from reporting to recommendations.

Deliverables:

- Daily operations digest.
- Tenant anomaly detection for usage and billing.
- Recommended next action based on health score and lifecycle state.
- Natural-language audit and lifecycle summaries.
- AI-assisted incident summary for grouped automation failures.
- "What changed since yesterday?" operator view.

## 8. Release Plan

1. Internal MVP: current console with seeded data.
2. Public onboarding patch: guest homepage before sign-in.
3. Billing alpha: Stripe sync in test mode.
4. Health-score beta: deterministic risk/expansion queues.
5. Alerts beta: in-app and email/Slack destinations.
6. Playbook beta: guided operator workflows.
7. Integration beta: support, CRM, and analytics ingestion.
8. Portfolio/demo release: screenshots, seeded walkthrough, and architecture
   notes.

## 9. Testing Plan

- Unit tests for RBAC checks, audit payloads, formatting, health scoring, and
  alert rule evaluation.
- API tests for unauthorized, forbidden, read-only, and admin mutation paths.
- Integration tests for Stripe sync and webhook idempotency.
- UI tests for overview, tenant filters, tenant detail, feature flag toggles,
  automation toggles, and audit visibility.
- Manual QA for seeded demo walkthrough and public homepage auth transitions.

## 10. Operational Risks

- Exposing private data on public routes. Mitigation: strict guest page split and
  API auth tests.
- Incorrect billing state. Mitigation: Stripe event IDs, sync timestamps,
  reconciliation UI, and audit trails.
- Alert fatigue. Mitigation: severity, cooldowns, dedupe, and operator
  ownership.
- Health score distrust. Mitigation: transparent reason breakdown and rule tests.
- Mutation safety. Mitigation: `ops_viewer` read-only role, audit logs, and
  explicit admin gates.

## 11. Out of Scope for v1

- Replacing a full CRM.
- Replacing a full support desk.
- Fully autonomous customer outreach.
- Complex enterprise approval chains.
- Multi-region incident management.
- Production financial reporting beyond operational billing visibility.

## 12. Documentation Ownership

- App operations: `apps/ops-hub/README.md`
- Product and milestone plan: this file
- Public homepage issue: `docs/issues/012-ops-hub-public-homepage.md`
- Database truth: `packages/db/prisma/schema.prisma`
- RBAC truth: `apps/ops-hub/lib/rbac.ts`
- Audit behavior: `apps/ops-hub/lib/audit.ts`

Update this plan whenever a milestone changes status or a new operational
surface becomes part of the product direction.
