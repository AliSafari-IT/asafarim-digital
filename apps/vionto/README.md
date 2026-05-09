# Vionto

Vionto is the AI-powered video script generation app in the ASafariM Digital workspace. It turns image collections into narrated video scripts with AI assistance, supporting multiple languages and content types.

## Development

```bash
pnpm --filter vionto dev
```

Local URL: `http://localhost:3006`

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Auth:** NextAuth 5 (shared via `@asafarim/auth` for SSO across apps)
- **AI Providers:** OpenAI (GPT-4.1-mini), Anthropic (Claude Haiku)
- **TTS:** ElevenLabs for text-to-speech
- **Storage:** DigitalOcean Spaces (S3-compatible)
- **Job Queue:** Redis/BullMQ for async processing
- **Worker:** Node.js background worker (vionto-worker)

## Environment Variables

Required for production:

```env
# App URLs
NEXT_PUBLIC_VIONTO_URL=https://vionto.asafarim.com
NEXT_PUBLIC_PORTAL_URL=https://portal-qa.asafarim.com

# AI Providers
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1-mini
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-haiku-4-5

# TTS
ELEVENLABS_API_KEY=...

# Storage (DigitalOcean Spaces)
DO_SPACES_ENDPOINT=https://...
DO_SPACES_REGION=...
DO_SPACES_BUCKET=...
DO_SPACES_KEY=...
DO_SPACES_SECRET=...

# Job Queue
REDIS_URL=redis://...

# Auth (shared with other apps)
AUTH_SECRET=...
AUTH_COOKIE_DOMAIN=.asafarim.com

# Database (shared)
DATABASE_URL=postgresql://...
```

## Current Scope

- Next.js app with script editor and content generation UI
- Authentication via NextAuth with SSO across ASafariM apps
- AI script generation using OpenAI and Anthropic
- Text-to-speech via ElevenLabs
- DigitalOcean Spaces integration for file storage
- Redis/BullMQ for async job processing
- Background worker (vionto-worker) for long-running tasks
- Health endpoint at `/api/health`
- Docker build target for production deployment

## Architecture

- **vionto:** Main Next.js app (port 3006)
- **vionto-worker:** Background worker for AI processing (port 3007)
- **Shared packages:** Uses `@asafarim/auth`, `@asafarim/db`, `@asafarim/ui`, `@asafarim/shared-i18n`, `@asafarim/country-language-selector`

## Docker Build

The Dockerfile uses build args to override localhost URLs from `.env`:

```dockerfile
ARG NEXT_PUBLIC_VIONTO_URL=https://vionto.asafarim.com
ARG NEXT_PUBLIC_PORTAL_URL=https://portal-qa.asafarim.com
ENV NEXT_PUBLIC_VIONTO_URL=${NEXT_PUBLIC_VIONTO_URL}
ENV NEXT_PUBLIC_PORTAL_URL=${NEXT_PUBLIC_PORTAL_URL}
```

This ensures production URLs are baked into the build while preserving API keys from `.env`.

## Deployment

Deployed via GitHub Actions workflow `.github/workflows/deploy.yml`:
1. Rsync code to VPS
2. Build Docker images with BuildKit
3. Run db-migrate for database updates
4. Start vionto and vionto-worker containers
5. Verify health endpoints

Production URL: `https://vionto.asafarim.com`
