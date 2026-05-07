# Vionto Web Issue 8 - Infra, Docker, Nginx, and Production Config

**Status:** Ready for development  
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

- [ ] Add `infra/nginx/vionto.asafarim.com.conf`.
- [ ] Add Nginx TLS/proxy config for Vionto web and static/media-safe limits.
- [ ] Add Docker Compose service for Vionto worker.
- [ ] Add Redis service or document managed Redis requirement.
- [ ] Add object storage env docs and production secret checklist.
- [ ] Add upload body-size limits aligned with Vionto quotas.
- [ ] Add health checks for web, worker, Redis, and storage connectivity.
- [ ] Update root `.env.example` and app `.env.example` with Vionto envs.

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
