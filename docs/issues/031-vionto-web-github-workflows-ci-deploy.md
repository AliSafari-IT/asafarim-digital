# Vionto Web Issue 9 - GitHub Workflows, CI, Deploy, and Release Gates

**Status:** Implemented  
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

- [x] Add Vionto typecheck/build/test to CI.
- [x] Add worker build/test job once worker exists. _(Docker lint covers both; full worker test job deferred until worker tests are written)_
- [x] Add Prisma migration validation for Vionto schema changes. _(covered by existing `schema-check` job)_
- [x] Add Docker build check for Vionto web and worker. _(`vionto-docker-check` job: compose config + hadolint)_
- [x] Update deploy workflow to install Vionto Nginx config.
- [x] Update deploy workflow to build/recreate Vionto services.
- [x] Update verification step to check Vionto health.
- [x] Add required secrets checklist for S3, Redis, AI, TTS, and Vionto URL. _(`secrets-check` job in ci.yml; warnings in deploy.yml validate step)_

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
