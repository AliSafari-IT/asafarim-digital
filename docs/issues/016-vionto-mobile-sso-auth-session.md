# Vionto Mobile Issue 2 - SSO and Session Continuity

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `auth`, `sso`, `security`

## Objective

Integrate Vionto mobile with the shared ASafariM SSO model so users can move between Portal, web Vionto, and Android without fragmented accounts.

## Source Review Notes

- Shared auth lives in `packages/auth`.
- NextAuth config currently supports Google and credentials providers.
- Trusted redirects include Portal, Content Generator, Ops Hub, EduMatch, and Marketing Content, but not Vionto yet.
- Cookie-domain SSO works for web subdomains, but Android needs an explicit callback/deep-link strategy.
- User roles and tenant state are projected into JWT/session callbacks.

## Scope

- [ ] Add Vionto web and mobile callback origins to the trusted redirect model.
- [ ] Define mobile sign-in method: browser-based OAuth with deep link return, credentials fallback, or both.
- [ ] Add `NEXT_PUBLIC_VIONTO_URL`, `VIONTO_URL`, and mobile callback env names to auth documentation.
- [ ] Add session refresh and sign-out behavior for mobile.
- [ ] Ensure deactivated users are blocked on mobile just like web.
- [ ] Define mobile-safe token storage rules and avoid storing raw provider tokens in app storage.
- [ ] Add Vionto-specific RBAC permissions if needed for project/export ownership.

## Acceptance Criteria

- A user can sign in once and access Vionto mobile with the same ASafariM identity.
- Mobile sign-out invalidates local session state.
- Deactivated users cannot continue using cached mobile sessions.
- Auth redirects cannot be abused for untrusted origins.
- Session payload includes user id, roles, tenant id, username, and active state.

## Test Plan

- Add unit coverage around trusted Vionto redirect origins.
- Add mobile auth smoke test for sign-in, refresh, and sign-out.
- Add negative test for untrusted callback URL.
- Verify account continuity between Portal and Vionto.
