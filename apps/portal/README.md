# Portal

Main public-facing ASafariM Digital website and shared entry point for the
monorepo apps. It owns the public homepage, account entry, shared navigation
integration, and showcase redirects into the product apps.

## Status

Current state: public portal plus app launcher.

Implemented:

- Next.js app with shared auth, database, location, i18n, navigation, and UI
  packages.
- Public homepage and showcase links.
- Redirect routes for Content Generator, Ops Hub, Marketing Content, and
  EduMatch-style app entry points.
- Shared auth/session behavior with the rest of the ASafariM app suite.
- Typecheck script for portal-specific validation.

Planned:

- App catalog driven entirely by shared navigation data.
- Role-aware launch tiles and environment-aware health badges.
- Unified account/billing entry point for cross-app purchases.
- Production-ready landing content and SEO refresh.

## Stack

- Next.js App Router
- React 19 and TypeScript
- Tailwind CSS v4
- NextAuth via `@asafarim/auth`
- Prisma via `@asafarim/db`
- Shared packages: location, navigation, i18n, country/language selector, UI
- Nodemailer for portal mail flows

## Local Development

From the repo root:

```bash
pnpm install
pnpm --filter portal dev
```

App: `http://localhost:3000`

## Scripts

```bash
pnpm --filter portal dev
pnpm --filter portal build
pnpm --filter portal start
pnpm --filter portal typecheck
pnpm --filter portal lint
pnpm --filter portal clean
```

## Showcase Redirects

| Portal route | Target app | Default local target |
| --- | --- | --- |
| `/showcase/content-generator` | Content Generator | `http://localhost:3001` |
| `/showcase/ops-hub` | Ops Hub | `http://localhost:3003` |
| `/showcase/marketing-content` | Marketing Content | `http://localhost:3004` |

Redirect pages resolve environment variables first, then fall back to local or
QA/production host conventions.

## Environment

```env
PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000

CONTENT_GENERATOR_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_GENERATOR_URL=http://localhost:3001
OPS_HUB_URL=http://localhost:3003
NEXT_PUBLIC_OPS_HUB_URL=http://localhost:3003
MARKETING_CONTENT_URL=http://localhost:3004
NEXT_PUBLIC_MARKETING_CONTENT_URL=http://localhost:3004

DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
AUTH_COOKIE_DOMAIN=
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

## Deployment Notes

- Local app port: `3000`.
- QA host convention: `https://portal-qa.asafarim.com`.
- Nginx config convention: `infra/nginx/portal-qa.asafarim.com.conf`.
- Portal redirects should be checked whenever an app moves between localhost,
  QA, and production subdomains.

## Documentation Tasks

- Keep this README focused on portal behavior.
- Document product-specific details in each app README.
- When adding a new app card, update the route table here and the root compose
  deployment notes if the app is containerized.
