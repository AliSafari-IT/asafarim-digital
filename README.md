# asafarim-digital

Monorepo for **asafarim-digital** applications and shared packages.

## Workspace Structure

```text
asafarim-digital/
  apps/
    portal/               # Main brand/freelancer website (Next.js)
    content-generator/    # AI content generation app (Next.js)
  packages/
    ui/                   # Shared UI package + brand tokens
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

## Environment Variables

Create env files as needed:
- Root: `.env`
- Portal: `apps/portal/.env`
- Content generator: `apps/content-generator/.env`

Common vars:

```env
# OpenAI
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini

# Anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-haiku-4-5

# App routing (portal -> content-generator)
CONTENT_GENERATOR_URL=https://content-generator-qa.asafarim.com
NEXT_PUBLIC_CONTENT_GENERATOR_URL=https://content-generator-qa.asafarim.com

# Optional base path for content-generator (usually empty for subdomain setup)
NEXT_PUBLIC_BASE_PATH=
```

## App Routing Strategy

Current setup uses **separate subdomain** for content-generator in QA/prod:
- Portal: `https://portal-qa.asafarim.com`
- Content Generator: `https://content-generator-qa.asafarim.com`

Portal card route `/showcase/content-generator` redirects to the configured content-generator URL.

## Docker Compose

Run production-like stack:

```bash
docker compose up -d --build
```

Mapped ports:
- Portal: host `3000` -> container `3000`
- Content Generator: host `3002` -> container `3001`

Health checks:
- `http://localhost:3000`
- `http://localhost:3001` (inside content-generator container)

## CI/CD (GitHub Actions)

Workflow: `.github/workflows/deploy.yml`

High-level deploy flow:
1. Checkout + SSH setup
2. Rsync repo to VPS
3. Install/enable nginx vhost configs
4. Rebuild + restart Docker services
5. Verify portal/content-generator health endpoints

Required GitHub Secrets:
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

## Nginx Notes

- `infra/nginx/portal-qa.asafarim.com.conf`
  - Serves portal
  - Redirects `/showcase/content-generator` to content-generator subdomain
- `infra/nginx/content-generator-qa.asafarim.com.conf`
  - Serves content-generator from VPS host port `3002`

## Troubleshooting

### 404 when clicking "Content Generator" card

- Ensure portal route redirects correctly.
- Ensure `CONTENT_GENERATOR_URL` points to live content-generator domain.
- Ensure content-generator nginx vhost is enabled and SSL cert exists.

### AI generation errors (502)

- Check provider API keys and model access.
- Confirm account billing/quota for selected provider.
- Verify env vars are loaded in runtime container.

### Deploy workflow fails at SSH/host setup

- Validate `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` secrets.
- Confirm VPS firewall/network allows SSH from GitHub runners.

## Security

- Never commit real API keys.
- Rotate keys immediately if exposed.
- Prefer separate keys per environment (dev/qa/prod).
