# Portal App

Main public-facing website for asafarim-digital.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS

## Local Development

From repo root:

```bash
pnpm --filter portal dev
```

Runs on:
- `http://localhost:3000`

## Available Scripts

```bash
pnpm --filter portal dev
pnpm --filter portal build
pnpm --filter portal start
pnpm --filter portal lint
pnpm --filter portal clean
```

## Key Pages/Flows

- Homepage at `/`
- Showcase section includes a Content Generator card
- Card route: `/showcase/content-generator`
  - Redirect handler is implemented in:
    - `app/showcase/content-generator/page.tsx`

## Content Generator Redirect Behavior

Redirect target order:
1. `CONTENT_GENERATOR_URL`
2. `NEXT_PUBLIC_CONTENT_GENERATOR_URL`
3. Fallback:
   - dev: `http://localhost:3001`
   - non-dev: `https://content-generator-qa.asafarim.com`

This allows local development + QA subdomain routing without code changes.

## Environment Variables

Typical vars used by portal runtime:

```env
PORTAL_URL=https://portal-qa.asafarim.com
CONTENT_GENERATOR_URL=https://content-generator-qa.asafarim.com
NEXT_PUBLIC_CONTENT_GENERATOR_URL=https://content-generator-qa.asafarim.com
```

## Production/QA Notes

- Portal domain is typically served via nginx vhost:
  - `infra/nginx/portal-qa.asafarim.com.conf`
- `/showcase/content-generator` is redirected to content-generator subdomain.

## Troubleshooting

### 404 on `/showcase/content-generator`

- Confirm redirect page exists in app router.
- Confirm portal is deployed with latest code.
- Confirm `CONTENT_GENERATOR_URL` is set correctly.
- Confirm content-generator vhost is active.
