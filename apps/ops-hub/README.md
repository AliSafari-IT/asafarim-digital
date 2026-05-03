# SaaS Operations Hub

Internal operator console for managing a SaaS business across tenants, users,
subscriptions, feature access, lifecycle state, metrics, automations, and audit
history.

## Status

Current state: operator MVP.

Implemented:

- Authenticated Next.js app with shared SSO.
- `ops_admin` and `ops_viewer` RBAC through the shared database seed.
- Tenant, plan, subscription, invoice, feature flag, lifecycle, usage,
  automation, and audit models in Prisma.
- KPI-first overview, tenant directory/detail, users, billing, feature flags,
  lifecycle, automations, and audit views.
- Read/write API routes with audit logging for operator mutations.
- Demo seed data for plans, tenants, subscriptions, invoices, flags, lifecycle
  events, usage metrics, automation runs, and feature overrides.

Planned:

- Stripe subscription sync.
- Support desk and CRM integrations.
- Alert routing to Slack/email.
- Custom dashboards and saved views.
- Tenant health scoring and playbooks.

## Stack

- Next.js App Router
- React 19 and TypeScript
- Tailwind CSS v4
- NextAuth via `@asafarim/auth`
- Prisma via `@asafarim/db`
- Shared UI package from the monorepo

## Local Development

From the repo root:

```bash
pnpm install
pnpm --filter ops-hub dev
```

App: `http://localhost:3003`
Health: `http://localhost:3003/api/health`

Seed data:

```bash
pnpm --filter @asafarim/db run db:seed
```

## Scripts

```bash
pnpm --filter ops-hub dev
pnpm --filter ops-hub build
pnpm --filter ops-hub start
pnpm --filter ops-hub lint
pnpm --filter ops-hub clean
```

## Route Map

| Route | Purpose |
| --- | --- |
| `/overview` | KPI landing and risk queue |
| `/tenants` | Filterable tenant directory |
| `/tenants/[slug]` | Tenant profile, billing, usage, users, lifecycle, flags |
| `/users` | User directory with tenant filter |
| `/billing` | Subscriptions and invoices |
| `/feature-flags` | Flag catalog, rollout state, tenant overrides |
| `/lifecycle` | Unified lifecycle event timeline |
| `/automations` | Scheduled jobs, event handlers, and run history |
| `/audit` | Operator mutation audit log |

## API Surface

| Route | Purpose |
| --- | --- |
| `/api/health` | Public liveness probe |
| `/api/overview` | Overview metrics |
| `/api/tenants` | Tenant list |
| `/api/tenants/[slug]` | Tenant detail and status mutation |
| `/api/feature-flags` | Feature flag list |
| `/api/feature-flags/[id]/toggle` | Toggle one flag |
| `/api/automations/[id]/toggle` | Toggle one automation |
| `/api/audit` | Audit log |

All routes use `lib/rbac.ts`; mutations also use `lib/audit.ts`.

## Roles

- `ops_viewer`: read-only access.
- `ops_admin`: read/write access.
- `superadmin`: treated as ops admin by seed and access checks.

## Environment

```env
PORTAL_URL=http://localhost:3000
OPS_HUB_URL=http://localhost:3003
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=http://localhost:3003
AUTH_TRUST_HOST=true
AUTH_COOKIE_DOMAIN=
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## Deployment Notes

- Local app port: `3003`.
- Production host convention: `https://ops-hub.asafarim.com`.
- Nginx config: `infra/nginx/ops-hub.asafarim.com.conf`.
- Docker service: `ops-hub` in the root compose stack.

## Documentation Tasks

- Update this README when adding new operator views or mutation APIs.
- Keep seed data notes current when changing `packages/db/prisma/seed.ts`.
