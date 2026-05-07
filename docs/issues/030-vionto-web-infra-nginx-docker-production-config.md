# Vionto Web Issue 8 - Infra, Docker, Nginx, and Production Config

**Status:** Implemented
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `infra`, `docker`, `nginx`, `production`

## Objective

Complete production infrastructure for Vionto in `infra`, Docker Compose, environment configuration, Nginx routing, TLS, and worker deployment.

## Source Review Notes

- Existing Nginx configs live in `infra/nginx`.
- Docker Compose now includes a Vionto web service on port `3006`.
- Deploy workflow installs Nginx configs for existing apps but not Vionto.
- Vionto worker, Redis dependency, object storage env validation, and domain config are not complete.

## Scope

- [x] Add `infra/nginx/vionto.asafarim.com.conf`.
- [x] Add Nginx TLS/proxy config for Vionto web and static/media-safe limits.
- [x] Add Docker Compose service for Vionto worker.
- [x] Add Redis service or document managed Redis requirement.
- [x] Add object storage env docs and production secret checklist.
- [x] Add upload body-size limits aligned with Vionto quotas.
- [x] Add health checks for web, worker, Redis, and storage connectivity.
- [x] Update root `.env.example` and app `.env.example` with Vionto envs.

## Acceptance Criteria

- Vionto can be deployed behind `vionto.asafarim.com`.
- Nginx config passes `nginx -t`.
- Web and worker services can be restarted independently.
- Production env variables are documented and validated.
- Upload limits are enforced consistently at Nginx, app, and plan levels.

## Test Plan

- Run Docker Compose config validation.
- Test local container build for Vionto web and worker.
- Validate Nginx config syntax.
- Smoke test `/api/health` and worker readiness endpoint.


## Implementation Notes

- Added/verified Vionto Nginx TLS proxy config for `vionto.asafarim.com`, with `500m` upload body limit and long upload proxy timeouts aligned to app quotas (`50 MB` images, `500 MB` zip imports).
- Added Redis service, Vionto worker service health checks, and independent web/worker restart paths in Docker Compose.
- Standardized Vionto storage envs on `DO_SPACES_*` to match `apps/vionto/lib/server/storage.ts`.
- Added web `/api/health` dependency checks for database, Redis, and object storage configuration; added worker HTTP readiness on port `3007`.
- Updated production deploy workflow to start Redis, build/start `vionto-worker`, and verify worker readiness.
- Validation performed: `pnpm install`, `pnpm typecheck`, and `docker compose config --quiet` passed. Full `pnpm build` was canceled before completion by the user.
