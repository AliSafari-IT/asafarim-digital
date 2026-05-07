# Vionto Web Issue 1 - Shared App Shell and Navigation Integration

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `navigation`, `shared-ui`, `production`

## Objective

Turn the current Vionto web shell into a first-class ASafariM app with shared navigation, shared UI patterns, app registry support, and production-ready metadata.

## Source Review Notes

- `apps/vionto` exists and builds successfully.
- The app currently uses a standalone UI and does not consume `@asafarim/ui`, `@asafarim/navigation`, or shared auth.
- `packages/db` has `AppRegistry` and `NavItem` models that can include Vionto.
- Root scripts and Docker Compose already include Vionto.

## Scope

- [ ] Add Vionto to app registry seed data.
- [ ] Add Vionto nav items and cross-app metadata.
- [ ] Integrate shared app shell/header patterns where appropriate.
- [ ] Add route-level metadata, Open Graph image, robots, sitemap, and health/readiness endpoints.
- [ ] Add Vionto links to Portal/app switcher flows.
- [ ] Ensure layout works across desktop, tablet, and mobile web.

## Acceptance Criteria

- Portal can discover and link to Vionto.
- Vionto appears in shared app navigation for allowed users.
- `/api/health` and a production readiness endpoint are available.
- SEO/social metadata is production-safe.
- Vionto web keeps a distinct product identity while following ASafariM platform conventions.

## Test Plan

- Add nav resolver tests for Vionto app scope.
- Build `pnpm --filter vionto build`.
- Smoke test Portal to Vionto navigation.
- Verify metadata output and health endpoint.
