# Vionto Web Issue 2 - Web SSO, RBAC, and Account Gating

**Status:** In Progress  
**Priority:** High  
**Assignee:** AI Assistant  
**Labels:** `vionto`, `web`, `auth`, `sso`, `rbac`

## Objective

Integrate Vionto web with shared SSO, RBAC, account limits, and tenant-aware access using `packages/auth` and `packages/db`.

## Source Review Notes

- `packages/auth` now trusts Vionto origin (`NEXT_PUBLIC_VIONTO_URL`) in the `redirect` callback.
- `apps/vionto` has middleware (`createAuthMiddleware`), `SessionProvider`, and `lib/server/auth.ts` helpers.
- `packages/db` seed includes Vionto permissions and roles (`vionto_creator`, `vionto_admin`).
- Account limits / quota gating remains pending (Milestone 5 feature).

## Scope

- [x] Add Vionto web URLs to trusted auth redirects and environment examples.
  - `packages/auth/src/index.ts`: `NEXT_PUBLIC_VIONTO_URL` added to `trustedOrigins`.
  - `docker-compose.yml` and `apps/vionto/.env.example` updated with auth env vars.
- [x] Add Vionto auth routes/sign-in pages or reuse shared auth pages consistently.
  - `apps/vionto/app/api/auth/[...nextauth]/route.ts` exports shared `handlers` from `@asafarim/auth`.
  - `apps/vionto/components/SessionProvider.tsx` wraps layout for client-side session.
- [x] Protect authenticated workspace routes.
  - `apps/vionto/middleware.ts`: public routes (`/`, `/api/health`, `/api/navigation`); all others redirect to portal sign-in.
  - `apps/vionto/lib/server/auth.ts`: `getAuthedUser`, `requireAuth`, and HTTP response helpers.
- [x] Define Vionto permissions for project create, render, export, admin support, and billing access.
  - `packages/db/prisma/seed.ts`: 12 Vionto permissions + `vionto_creator` and `vionto_admin` roles seeded.
- [ ] Add account limits using tenant plan and feature flag data.
  - **Pending:** Requires Milestone 5 quota/rendering pipeline to enforce render count, storage, and max images per project.
- [x] Add deactivated-user and unverified-account handling.
  - Already covered by `@asafarim/auth` (`signIn` callback blocks `!isActive` users; middleware returns 403 for deactivated sessions).

## Acceptance Criteria

- Vionto web requires auth for project creation, uploads, render, and export.
- Cross-subdomain SSO works with existing ASafariM cookies in production.
- Authorization decisions are server-side and testable.
- Plans/quotas can gate render count, storage, and max images per project.
- Untrusted callback URLs are rejected.

## Test Plan

- Add unit tests for trusted Vionto redirect origins.
- Add route tests for anonymous/authenticated access.
- Add quota enforcement tests.
- Manually verify Portal -> Vionto SSO in local multi-port setup.
