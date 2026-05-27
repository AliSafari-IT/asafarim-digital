# asafarim-digital 

Monorepo for **asafarim-digital** applications and shared packages.

## Workspace Structure

```text
asafarim-digital/
  apps/
    portal/               # Main brand/freelancer website (Next.js)
    content-generator/    # AI content generation app (Next.js)
    ops-hub/              # Internal operations dashboard (Next.js)
    marketing-content/    # Marketing content management (Next.js)
    edumatch/             # Educational matching platform (Next.js)
    vionto/               # AI video script generation (Next.js)
    vionto-worker/        # Background worker for Vionto (Node.js)
  packages/
    auth/                 # Shared NextAuth configuration
    db/                   # Prisma schema and client
    types/                # Shared TypeScript types
    navigation/           # Navigation components
    ui/                   # Shared UI package + brand tokens
    location/             # Location utilities
    shared-i18n/          # Internationalization
    country-language-selector/  # Country/language dropdown
  infra/
    nginx/                # VPS nginx vhost configs
  .github/workflows/      # CI/CD workflows
  docker-compose.yml      # Production-like local/VPS composition
  start.sh                # Bash helper script
  start.ps1               # PowerShell helper script
```

## Tech Stack

- **Monorepo orchestration:** Turbo
- **Package manager:** pnpm
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Deployment:** GitHub Actions + Docker Compose + Nginx (VPS)

## Prerequisites

- Node.js `>=20`
- pnpm `10.x`
- Docker + Docker Compose (for containerized run)

## Getting Started (Local)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Run all apps in dev

```bash
pnpm dev
```

By default:
- Portal: `http://localhost:3000`
- Content Generator: `http://localhost:3001`
- Ops Hub: `http://localhost:3003`
- Marketing Content: `http://localhost:3004`
- EduMatch: `http://localhost:3005`
- Vionto: `http://localhost:3006`

### 3) Build all apps

```bash
pnpm build
```

## Convenience Scripts

### Bash

```bash
./start.sh --help
./start.sh install dev
./start.sh build
```

### PowerShell

```powershell
.\start.ps1 -Help
.\start.ps1 install dev
.\start.ps1 build
```

## VPS Management

### Automated Storage Monitoring

The VPS has automated storage monitoring that runs every 2 hours via GitHub Actions:
- **Triggers cleanup when free space < 25GB**
- **Removes Docker images older than 3 hours**
- **Cleans build cache and unused resources**
- **Monitors container health after cleanup**

### Manual Cleanup Commands

```bash
# Smart cleanup (only if disk space < 25GB)
pnpm onVPS:cleanup

# Dry run (see what would be cleaned)
pnpm onVPS:cleanup:dry

# Force cleanup regardless of disk space
ssh vps "cd /var/repos/asafarim-digital && ./scripts/vps-cleanup.sh --force"

# Custom age threshold (e.g., 6 hours)
ssh vps "cd /var/repos/asafarim-digital && ./scripts/vps-cleanup.sh --age 6"
```

### VPS Scripts

```bash
# Restart services (fast, uses existing images)
pnpm rs

# Full cleanup + restart (when disk space is low)
pnpm prers

# Aggressive cleanup (removes all unused containers/images)
pnpm onVPS:prune
```

## Environment Variables

Create env files as needed:
- Root: `.env`
- Portal: `apps/portal/.env`
- Content Generator: `apps/content-generator/.env`
- Ops Hub: `apps/ops-hub/.env`
- Marketing Content: `apps/marketing-content/.env`
- EduMatch: `apps/edumatch/.env`
- Vionto: `apps/vionto/.env`

Common vars:

```env
# OpenAI
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini

# Anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-haiku-4-5

# App URLs (production)
NEXT_PUBLIC_PORTAL_URL=https://portal.asafarim.com
NEXT_PUBLIC_CONTENT_GENERATOR_URL=https://content-generator.asafarim.com
NEXT_PUBLIC_OPS_HUB_URL=https://ops-hub.asafarim.com
NEXT_PUBLIC_MARKETING_CONTENT_URL=https://marketing-content.asafarim.com
NEXT_PUBLIC_EDUMATCH_URL=https://edumatch.asafarim.com
NEXT_PUBLIC_VIONTO_URL=https://vionto.asafarim.com

# Database
DATABASE_URL=postgresql://...

# Redis/BullMQ (for job queues)
REDIS_URL=redis://...

# DigitalOcean Spaces (object storage)
DO_SPACES_ENDPOINT=...
DO_SPACES_REGION=...
DO_SPACES_BUCKET=...
DO_SPACES_KEY=...
DO_SPACES_SECRET=...

# Email (Resend)
RESEND_API_KEY=...
FROM_EMAIL=...

# ElevenLabs (TTS)
ELEVENLABS_API_KEY=...

# Stripe (payments)
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

# Google Maps
GOOGLE_MAPS_API_KEY=...

# Auth (shared across apps for SSO)
AUTH_SECRET=...
AUTH_COOKIE_DOMAIN=.asafarim.com
```

## App Routing Strategy

Current setup uses **separate subdomains** for each app in QA/prod:
- Portal: `https://portal.asafarim.com`
- Content Generator: `https://content-generator.asafarim.com`
- Ops Hub: `https://ops-hub.asafarim.com`
- Marketing Content: `https://marketing-content.asafarim.com`
- EduMatch: `https://edumatch.asafarim.com`
- Vionto: `https://vionto.asafarim.com`

All apps share authentication via NextAuth with SSO across subdomains using `AUTH_COOKIE_DOMAIN=.asafarim.com`.

## Docker Compose

Run production-like stack:

```bash
docker compose up -d --build
```

Mapped ports:
- Portal: host `3000` -> container `3000`
- Content Generator: host `3002` -> container `3002`
- Ops Hub: host `3003` -> container `3003`
- Marketing Content: host `3004` -> container `3004`
- EduMatch: host `3005` -> container `3005`
- Vionto: host `3006` -> container `3006`
- Vionto Worker: host `3007` -> container `3007`

Health checks:
- `http://localhost:3000/api/health` (portal)
- `http://localhost:3002/api/health` (content-generator)
- `http://localhost:3003/api/health` (ops-hub)
- `http://localhost:3004/api/health` (marketing-content)
- `http://localhost:3005/api/health` (edumatch)
- `http://localhost:3006/api/health` (vionto)
- `http://localhost:3007` (vionto-worker)

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`

High-level deploy flow:
1. Checkout + SSH setup
2. Rsync repo to VPS
3. Install/enable nginx vhost configs
4. Rebuild + restart Docker services
5. Verify all service health endpoints

Required GitHub Secrets:
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

## Nginx Notes

Nginx configs are located in `infra/nginx/`:

- `portal.asafarim.com.conf` - Serves portal on port 3000
- `content-generator.asafarim.com.conf` - Serves content-generator on port 3002
- `ops-hub.asafarim.com.conf` - Serves ops-hub on port 3003
- `marketing-content.asafarim.com.conf` - Serves marketing-content on port 3004
- `edumatch.asafarim.com.conf` - Serves edumatch on port 3005
- `vionto.asafarim.com.conf` - Serves vionto on port 3006

All configs are installed to `/etc/nginx/sites-available/` and symlinked to `/etc/nginx/sites-enabled/` during deployment.

## Troubleshooting

### Service health check failures

- Check container logs: `docker logs <container-name> --tail=50`
- Verify env vars are loaded: `docker compose exec <service> env`
- Check database connectivity from within container

### Auth redirect loops or wrong app after sign-in

- Verify `AUTH_COOKIE_DOMAIN=.asafarim.com` is set in all apps
- Ensure `NEXT_PUBLIC_*_URL` env vars are set to correct production URLs
- Check that nginx configs point to correct container ports

### Docker build fails with module not found

- Ensure all required packages are copied in Dockerfile
- Verify workspace packages are built before the app that depends on them
- Check that `pnpm-workspace.yaml` includes all packages

### Puppeteer/Chromium download during build (slow builds)

- Ensure `PUPPETEER_SKIP_DOWNLOAD=true` is set in Dockerfile
- Verify env vars are set before `pnpm install` step
- Check that puppeteer version supports the skip env var (use `PUPPETEER_SKIP_DOWNLOAD` for v21+)

### SSH connection drops during long builds

- Deploy workflow uses `ServerAliveInterval=30` to keep connection alive
- If still failing, check VPS SSH timeout settings
- Consider increasing keepalive interval in `.github/workflows/deploy.yml`

### Deploy workflow fails at SSH/host setup

- Validate `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` secrets.
- Confirm VPS firewall/network allows SSH from GitHub runners.

### AI generation errors (502)

- Check provider API keys and model access.
- Confirm account billing/quota for selected provider.
- Verify env vars are loaded in runtime container.

## Security

- Never commit real API keys.
- Rotate keys immediately if exposed.
- Prefer separate keys per environment (dev/qa/prod).
