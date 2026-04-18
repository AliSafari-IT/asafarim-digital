# Marketing Content — Growth Engine

Showcase app for a marketing / growth operations system:
campaigns, content, SEO, leads, automations, and analytics.

Shares SSO with the rest of the ASafariM Digital monorepo via `@asafarim/auth`.

## Local development

```bash
pnpm --filter marketing-content dev
# → http://localhost:3004
```

The app runs on **port 3004** to avoid colliding with portal (3000),
content-generator (3001), ops-hub (3003).

## Production

| Thing        | Value                                       |
| ------------ | ------------------------------------------- |
| Public host  | `https://marketing-content.asafarim.com`    |
| Docker port  | 3004                                        |
| Auth         | Shared SSO via `@asafarim/auth` + next-auth |
| DB           | Shared `@asafarim/db` (Prisma, for session) |

## Portal integration

The portal homepage card "Marketing + Content Engine" links to
`/showcase/marketing-content`, which redirects to:

- `LOCAL_MARKETING_CONTENT_URL` (dev, default `http://localhost:3004`)
- `MARKETING_CONTENT_URL` / `NEXT_PUBLIC_MARKETING_CONTENT_URL` (prod)
- Fallback: `https://marketing-content.asafarim.com`

## Environment variables

See `.env.example`. The essentials:

- `PORTAL_URL`, `NEXT_PUBLIC_PORTAL_URL` — portal for sign-in redirects
- `DATABASE_URL` — shared DB (read for session lookup)
- `AUTH_SECRET` — must match other apps in the SSO ring
- `AUTH_URL=https://marketing-content.asafarim.com`
- `AUTH_TRUST_HOST=true`
- `AUTH_COOKIE_DOMAIN=.asafarim.com`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`

## Auth

All routes require an authenticated user. Only `/api/health` is public
(used by the container healthcheck and nginx). Unauthenticated requests
are redirected to `${PORTAL_URL}/sign-in`.

There is no role gate — any signed-in ASafariM user can open the app.

## Deploy dependencies

- Nginx vhost: `infra/nginx/marketing-content.asafarim.com.conf`
- Docker service: `marketing-content` in root `docker-compose.yml`
- CI/CD step: see `.github/workflows/deploy.yml`

## Demo data

All pages use static demo data from `lib/demo-data.ts`. No DB writes
are performed by this app.
