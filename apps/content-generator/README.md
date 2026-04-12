# Content Generator App

AI content generation app for creating production-ready drafts (blog, product, email, social, summary).

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Shared UI tokens/components from `@asafarim/ui`

## Local Development

From repo root:

```bash
pnpm --filter content-generator dev
```

Runs on:
- `http://localhost:3001`

## Available Scripts

```bash
pnpm --filter content-generator dev
pnpm --filter content-generator build
pnpm --filter content-generator start
pnpm --filter content-generator lint
pnpm --filter content-generator clean
```

## Core Features

- Prompt input + content type selector
- Generate output card
- Copy output
- Regenerate output
- API error handling with provider details
- OpenAI -> Anthropic fallback in API route

## API Endpoint

- Route: `POST /api/generate`
- File: `app/api/generate/route.ts`
- Request body:

```json
{
  "type": "blog",
  "input": "Write an intro about AI copilots for SaaS founders"
}
```

- Response (success):

```json
{
  "output": "...generated text..."
}
```

- Response (failure):

```json
{
  "error": "OpenAI: ... | Anthropic: ..."
}
```

## Provider Fallback Logic

Generation order:
1. OpenAI (`OPENAI_API_KEY`)
2. Anthropic (`ANTHROPIC_API_KEY`) if OpenAI fails/unavailable

Model vars:

```env
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-haiku-4-5
```

## Environment Variables

```env
# OpenAI
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini

# Anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-haiku-4-5

# Optional base path (empty for subdomain deployment)
NEXT_PUBLIC_BASE_PATH=
```

## Deployment Notes

- QA domain commonly served from nginx:
  - `content-generator-qa.asafarim.com`
- Docker host mapping in current compose:
  - host `3002` -> container `3001`

## Troubleshooting

### 502 on generate

- Validate provider keys.
- Confirm model access and billing/quota.
- Check container/runtime env values.

### Static assets or routing mismatch

- Ensure `NEXT_PUBLIC_BASE_PATH` matches deployment strategy:
  - Subdomain strategy: empty
  - Path strategy: e.g. `/showcase/content-generator`
