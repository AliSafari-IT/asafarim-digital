# SaaS Operations Hub

Internal operator console for managing a SaaS business across tenants, users, subscriptions, feature access, lifecycle state, metrics, and automations.

Lives at `apps/ops-hub`, runs on port **3003**, and is deployed to **https://ops-hub.asafarim.com**. Shares the same Auth.js session and Prisma database as the portal — SSO works automatically across subdomains via the `.asafarim.com` cookie domain.

---

## 1. Product brief

**Who it's for.** SaaS operators — founders, CS, finance, product — who need a single surface to inspect a customer, act on risk, and control rollout.

**Why not just a generic admin.** Admin CRUD tells you what's in the database. An ops hub tells you what the business is doing: which tenants are paying, who's about to churn, what's paused, what's rolling out. Every screen is built around an operator job-to-be-done, not a model.

**Design principles.**
- **KPI-first landings.** Every page opens with quantified state, not just a list.
- **One-click triage.** From the overview, operators can reach any at-risk tenant in one click.
- **Safe defaults.** `ops_viewer` is read-only. Only `ops_admin` can mutate. Every mutation is audit-logged.
- **Extensible.** Schema leaves hooks for Stripe sync (`Subscription.externalId`), alert integrations (`Automation.action`), and support tools (`LifecycleEvent.kind`).

---

## 2. Database schema changes

Added to `packages/db/prisma/schema.prisma`:

- **`Tenant`** — extended with `status`, `mrrCents`, `seats`, `region`, `industry`, `trialEndsAt`, `churnedAt`.
- **`Plan`** — catalog of subscription plans (free/starter/pro/enterprise), with price, seat limit, and default feature set.
- **`Subscription`** — per-tenant active subscription with `status`, `renewsAt`, `seats`, `mrrCents`, `externalId` (Stripe hook).
- **`Invoice`** — per-subscription invoices with `status`, `amountCents`, `issuedAt`, `paidAt`.
- **`FeatureFlag`** — global flags with `category` (general/beta/experimental/killswitch), `defaultEnabled`, `rolloutPercent`.
- **`FeatureFlagOverride`** — per-tenant overrides with operator `note`.
- **`LifecycleEvent`** — timeline of tenant events (signup, activated, upgraded, churn_risk, churned, expansion, support_ticket).
- **`UsageMetric`** — weekly usage rollups (api_calls, active_users), unique per tenant+metric+period.
- **`Automation`** + **`AutomationRun`** — scheduled jobs + event handlers, with per-run logs.

Roles & permissions added to `seed.ts`:

- `ops_admin` — full ops hub (view + mutate).
- `ops_viewer` — read-only ops hub access.
- 11 new permissions in the `ops` group wired to those roles.
- `superadmin` users are automatically granted `ops_admin` on each seed run.

---

## 3. Route map

| Path | Purpose |
|---|---|
| `/overview` | KPI landing — MRR, active/at-risk tenants, churn risk queue, plan mix, recent events |
| `/tenants` | Filterable tenant directory (search / status / plan) |
| `/tenants/[slug]` | Tenant profile: KPIs, usage chart, billing, users, lifecycle timeline, feature overrides |
| `/users` | User directory with tenant filter |
| `/billing` | Subscriptions + invoices with status filter |
| `/feature-flags` | Flags grouped by category with toggle + rollout bars |
| `/lifecycle` | Unified event timeline with kind filter |
| `/automations` | Scheduled jobs + event handlers with toggle + run history |
| `/audit` | Audit log of every operator mutation |

**APIs** (JSON, same auth + RBAC): `/api/health`, `/api/overview`, `/api/tenants`, `/api/tenants/[slug]` (GET/PATCH), `/api/feature-flags`, `/api/feature-flags/[id]/toggle`, `/api/automations/[id]/toggle`, `/api/audit`.

---

## 4. UI implementation

- App shell in `components/Shell.tsx` (sidebar + topbar, current path highlighting, role badges).
- Reusable atoms: `KpiCard`, `StatusBadge` (tone-aware), usage bars, timeline rails.
- Tailwind v4 with a dedicated `globals.css` theme — deeper blues/indigos than the portal to make the hub feel like a control room.
- Filters use URL search params (server-side filterable, bookmarkable).
- Feature flag / automation toggles use Client Components with optimistic UI + `router.refresh()` on success.

---

## 5. API endpoints

All endpoints share the same RBAC (`lib/rbac.ts`) and audit logging (`lib/audit.ts`).

- `requireOps("read")` → `ops_admin`, `ops_viewer`, or `superadmin`.
- `requireOps("write")` → `ops_admin` or `superadmin` only.
- Mutations (`PATCH /api/tenants/[slug]`, `/api/feature-flags/[id]/toggle`, `/api/automations/[id]/toggle`) write to `AuditLog` with before/after `changes` payload.

---

## 6. Seed script

`packages/db/prisma/seed.ts` extended with a dedicated `seedOpsHub()` section that creates:

- **4 plans** (Free / Starter / Pro / Enterprise) with realistic pricing and feature lists.
- **10 feature flags** across general / beta / experimental / killswitch.
- **12 demo tenants** (Acme Corp, Umbrella Research, Wayne Enterprises, …) with industries, regions, plans, seat counts, and storyline statuses (one past-due, one churned, one in trial).
- Matching **subscriptions + up to 6 monthly invoices** per tenant, with past-due tenants carrying an open invoice.
- **Lifecycle event storylines** per tenant (signup → activated → upgraded → churn_risk / expansion / support_ticket).
- **6 weekly usage rollups** per tenant (api_calls, active_users) with growth baked in.
- **6 feature flag overrides** with operator notes.
- **6 automations** (churn_risk_alert, past_due_dunning, trial_ending_nudge, expansion_candidate, legacy_api_deprecation, new_signup_welcome) each with run history.

Run: `DATABASE_URL=... pnpm --filter @asafarim/db run db:seed`.

---

## 7. Deployment / env notes

**Environment variables** (see `.env.example`):

```
PORTAL_URL, OPS_HUB_URL, NEXT_PUBLIC_PORTAL_URL
DATABASE_URL
AUTH_SECRET, AUTH_URL, AUTH_TRUST_HOST, AUTH_COOKIE_DOMAIN
AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
```

**Docker.** `apps/ops-hub/Dockerfile` follows the same multi-stage pattern as portal & content-generator (pnpm install → `@asafarim/db` build → next build → alpine runner on port 3003). The service is added to `docker-compose.yml` as `ops-hub` with `depends_on: db-migrate`.

**Nginx.** `infra/nginx/ops-hub.asafarim.com.conf` mirrors the existing sites: TLS via Let's Encrypt, proxy to `127.0.0.1:3003`, long cache for `/_next/static/`.

**CI/CD.** Add `ops-hub` to the docker compose `build` and `up -d --force-recreate` lines in `.github/workflows/deploy.yml`. Nginx install line for the new config too. Let's Encrypt: `sudo certbot --nginx -d ops-hub.asafarim.com` on first deploy.

**DNS.** Point `ops-hub.asafarim.com` A record to the VPS.

---

## 8. Demo walkthrough

**From zero to "oh nice" in 90 seconds:**

1. **Sign in to the portal** (`https://portal-qa.asafarim.com`) with a superadmin account. Seed automatically grants you `ops_admin`.
2. **Open `https://ops-hub.asafarim.com`** — SSO picks up the session. Land on Overview.
3. **Overview** — glance at MRR, active tenants, at-risk count, open invoices. Notice the **Churn risk queue** highlighting `Fabrikam Inc` (past-due). Click it.
4. **Tenant detail** — see the full picture: plan (Starter), status (past_due), weekly API-call bars dipping, a `churn_risk` event on the timeline, the open invoice in the billing panel.
5. **Back to tenants**, filter `status = active, plan = enterprise` — see Acme Corp, Umbrella, Wayne. Click `Umbrella Research`.
6. **Umbrella** has a `Feature overrides` panel — `AI Copilot` is enabled for them with the note "Design partner for early access".
7. **Feature Flags** — toggle a general flag; watch the UI react, then open **Audit Log** and see `feature_flag.toggle` with your email, before/after payload, timestamp.
8. **Automations** — `Past-due dunning sequence` shows a success rate; one run last week is `failed` ("SMTP timeout"). Disable `Legacy API deprecation notice` with the toggle; re-check the audit log.
9. **Lifecycle** — filter by `churn_risk` to get a queue view; filter by `expansion` to celebrate growth.
10. **Sign in as a non-ops user** — the layout renders the restricted screen with a link back to the portal. Role gate works.

That's the MVP. Stripe sync, alert wiring, support tools, and custom dashboards all attach cleanly to the existing schema.
