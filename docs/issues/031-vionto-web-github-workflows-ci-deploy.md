# Vionto Web Issue 9 - GitHub Workflows, CI, Deploy, and Release Gates

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `github-actions`, `ci`, `deploy`, `release`

## Objective

Update GitHub workflows so Vionto web, worker, database migrations, and infra changes are validated and deployable through the same production gates as the existing apps.

## Source Review Notes

- `.github/workflows/ci.yml` builds Portal and EduMatch explicitly, but not Vionto.
- `.github/workflows/deploy.yml` builds/restarts existing services and installs existing Nginx configs, but not Vionto.
- Existing PR checks, branch protection, issue triage, and deployment workflows are available.

## Scope

- [ ] Add Vionto typecheck/build/test to CI.
- [ ] Add worker build/test job once worker exists.
- [ ] Add Prisma migration validation for Vionto schema changes.
- [ ] Add Docker build check for Vionto web and worker.
- [ ] Update deploy workflow to install Vionto Nginx config.
- [ ] Update deploy workflow to build/recreate Vionto services.
- [ ] Update verification step to check Vionto health.
- [ ] Add required secrets checklist for S3, Redis, AI, TTS, and Vionto URL.

## Acceptance Criteria

- A PR touching Vionto fails if web build, typecheck, schema validation, or worker tests fail.
- Main deploy includes Vionto web and worker.
- Deployment verification fails if Vionto health is down.
- Workflow logs do not expose AI, TTS, storage, or auth secrets.
- Release notes can reference issue IDs for Vionto changes.

## Test Plan

- Run CI on a branch with Vionto-only changes.
- Dry-run Docker build jobs where supported.
- Verify deploy workflow references Vionto in build, restart, and health-check steps.
- Confirm branch protection can require Vionto jobs.
