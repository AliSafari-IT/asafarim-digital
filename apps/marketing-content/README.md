# Marketing Content

Growth operations showcase app for campaigns, content planning, SEO, leads,
automations, and analytics. It is currently a read-only demo surface backed by
static data and shared ASafariM authentication.

## Status

Current state: authenticated showcase MVP.

Implemented:

- Auth-protected Next.js app with shared SSO.
- **Persisted campaigns + weekly performance entries** (`MarketingCampaign`,
  `MarketingPerformanceEntry` via `@asafarim/db`). Shared demo rows (`ownerId`
  null) are seeded from `lib/demo-data.ts`; user-created rows are private.
- **Interactive campaigns list**: URL-synced channel/status filters, name/owner
  search, sortable columns, and lifecycle actions (edit, pause/resume, end,
  delete). List and detail KPIs are both derived from entries, so they match.
- **Insights**: budget-pacing alerts, CPA-vs-target flags, and weekly anomaly
  highlights.
- **CSV export** of a campaign's weekly timeline and of the filtered list.
- **Role-based access**: `superadmin`/`admin` are editors (create/log/manage);
  everyone else is a read-only viewer. Write affordances are hidden for viewers
  and enforced server-side. Campaign writes are recorded in `AuditLog`, and the
  detail page shows who last edited a campaign.
- Static demo data (`lib/demo-data.ts`) still backs the content, SEO, lead,
  automation, and analytics views.
- Public health route for container and nginx checks.
- Portal integration via `/showcase/marketing-content`.

Planned:

- Replace remaining static demo data (content, SEO, leads, automations).
- Add editorial calendar workflows and approvals.
- Add lead capture, enrichment, and attribution events.
- Add automation run history and provider integrations.
- Add analytics ingestion from Search Console, PostHog, and email tools.

## Stack

- Next.js App Router
- React 19 and TypeScript
- Tailwind CSS v4
- NextAuth via `@asafarim/auth`
- Prisma session access via `@asafarim/db`
- Shared UI package from the monorepo

## Local Development

From the repo root:

```bash
pnpm install
pnpm --filter marketing-content dev
```

App: `http://localhost:3004`
Health: `http://localhost:3004/api/health`

## Scripts

```bash
pnpm --filter marketing-content dev
pnpm --filter marketing-content build
pnpm --filter marketing-content start
pnpm --filter marketing-content lint
pnpm --filter marketing-content clean
```

## Auth

All app pages require an authenticated ASafariM user. `/api/health` is public.
Unauthenticated users are redirected to the portal sign-in route through
`PORTAL_URL`.

Any signed-in ASafariM user can view the demo. Write access (creating campaigns,
logging performance, editing/deleting) requires an editor role — `superadmin` or
`admin` — resolved from the SSO session and enforced in the server actions.
Everyone else is a read-only viewer.

## Portal Integration

The portal card for "Marketing + Content Engine" links to
`/showcase/marketing-content`, which redirects in this order:

1. `LOCAL_MARKETING_CONTENT_URL` in development.
2. `MARKETING_CONTENT_URL`.
3. `NEXT_PUBLIC_MARKETING_CONTENT_URL`.
4. `https://marketing-content.asafarim.com`.

## Environment

```env
PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000
MARKETING_CONTENT_URL=https://marketing-content.asafarim.com
NEXT_PUBLIC_MARKETING_CONTENT_URL=https://marketing-content.asafarim.com
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=http://localhost:3004
AUTH_TRUST_HOST=true
AUTH_COOKIE_DOMAIN=
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## Deployment Notes

- Local app port: `3004`.
- Production host convention: `https://marketing-content.asafarim.com`.
- Nginx config: `infra/nginx/marketing-content.asafarim.com.conf`.
- Docker service: `marketing-content` in the root compose stack.

## Documentation Tasks

- Keep this README focused on current operation and integration points.
- Add a dedicated project plan before moving this app from showcase to product.
