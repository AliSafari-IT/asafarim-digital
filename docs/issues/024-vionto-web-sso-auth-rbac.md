# Vionto Web Issue 2 - Web SSO, RBAC, and Account Gating

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `web`, `auth`, `sso`, `rbac`

## Objective

Integrate Vionto web with shared SSO, RBAC, account limits, and tenant-aware access using `packages/auth` and `packages/db`.

## Source Review Notes

- `packages/auth` currently trusts Portal, Content Generator, Ops Hub, EduMatch, and Marketing Content origins.
- Vionto origin is not yet included in trusted redirect handling.
- `packages/db` already supports users, roles, permissions, tenants, plans, feature flags, usage metrics, and subscriptions.
- `apps/vionto` does not currently call `auth()`.

## Scope

- [ ] Add Vionto web URLs to trusted auth redirects and environment examples.
- [ ] Add Vionto auth routes/sign-in pages or reuse shared auth pages consistently.
- [ ] Protect authenticated workspace routes.
- [ ] Define Vionto permissions for project create, render, export, admin support, and billing access.
- [ ] Add account limits using tenant plan and feature flag data.
- [ ] Add deactivated-user and unverified-account handling.

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
