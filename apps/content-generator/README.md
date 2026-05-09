# Content Generator

AI-assisted content workspace for ASafariM Digital. The app helps authenticated
users create, organize, and refine production-ready copy for blog posts, product
pages, email, social posts, summaries, and custom content types.

Full roadmap: [docs/content-generator-project-plan.md](../../docs/content-generator-project-plan.md)

## Status

Current state: workspace MVP in progress.

Implemented:

- Authenticated Next.js app using shared `@asafarim/auth` and `@asafarim/db`.
- AI generation endpoint with OpenAI primary provider and Anthropic fallback.
- User-owned project folders, chat sessions, chat messages, saved prompts, and
  custom content type definitions.
- Provider metadata persistence for model, token counts, status, and errors.
- Prompt validation and ownership checks for folder/session access.
- Workspace UI with project switching, recent sessions, saved prompts, theme
  controls, app switcher, and account menu.
- SEO helpers, Open Graph/Twitter image routes, robots, sitemap, and health API.
- Vitest coverage for validation, generation helpers, and content type behavior.

Near-term gaps:

- Streaming responses in the workspace UI.
- Draft editor with version history and structured export.
- Brand voice profiles and reusable campaign briefs.
- Team/tenant sharing rules beyond current ownership checks.
- Usage quotas, cost dashboards, and admin review tools.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS v4
- NextAuth via `@asafarim/auth`
- Prisma via `@asafarim/db`
- Shared UI/i18n packages from the monorepo
- OpenAI Responses API with Anthropic Messages API fallback
- Vitest for focused server-side tests

## Local Development

From the repo root:

```bash
pnpm install
pnpm --filter content-generator dev
```

App: `http://localhost:3001`
Health: `http://localhost:3001/api/health`

## Scripts

```bash
pnpm --filter content-generator dev
pnpm --filter content-generator build
pnpm --filter content-generator start
pnpm --filter content-generator test
pnpm --filter content-generator test:watch
pnpm --filter content-generator lint
pnpm --filter content-generator clean
```

## Route Map

| Route | Purpose |
| --- | --- |
| `/` | Authenticated content workspace |
| `/api/health` | Public liveness probe |
| `/api/generate` | Generate copy and persist session/generation records |
| `/api/projects` | List/create project folders |
| `/api/projects/[id]` | Update/delete one project folder |
| `/api/chats` | List/create chat sessions |
| `/api/chats/[id]` | Read/update/delete one chat session |
| `/api/chats/[id]/messages` | List messages for a session |
| `/api/prompts` | List/create saved prompts |
| `/api/prompts/[id]` | Update/delete saved prompts |
| `/api/content-types` | List/create custom content types |
| `/api/content-types/[id]` | Update/delete custom content types |
| `/api/auth/[...nextauth]` | Shared NextAuth handler |

## Generation API

`POST /api/generate`

```json
{
  "type": "blog",
  "input": "Write a product launch post for a privacy-first analytics tool.",
  "folderId": "optional-folder-id",
  "sessionId": "optional-session-id"
}
```

Successful response:

```json
{
  "output": "...generated text...",
  "sessionId": "...",
  "generationId": "...",
  "messageId": "...",
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "truncated": false,
  "stopReason": "completed"
}
```

Provider order:

1. OpenAI, using `OPENAI_API_KEY` and `OPENAI_MODEL`.
2. Anthropic, using `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`, when OpenAI is
   unavailable or fails.

## Environment

```env
# App URLs
NEXT_PUBLIC_BASE_PATH=
PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_PORTAL_URL=http://localhost:3000

# Auth and database
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_URL=http://localhost:3001
AUTH_TRUST_HOST=true
AUTH_COOKIE_DOMAIN=

# AI providers
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
OPENAI_MAX_OUTPUT_TOKENS=4000
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-haiku-4-5
ANTHROPIC_MAX_TOKENS=4000
```

## Deployment Notes

- Local app port: `3001`.
- Current Docker host mapping: host `3002` to container `3001`.
- QA domain convention: `https://content-generator.asafarim.com`.
- Portal redirect: `/showcase/content-generator`.

## Documentation Tasks

- Keep this README focused on how the app works today.
- Keep forward-looking product strategy in
  [docs/content-generator-project-plan.md](../../docs/content-generator-project-plan.md).
- When adding new API routes, update the route map and environment section in
  the same change.
