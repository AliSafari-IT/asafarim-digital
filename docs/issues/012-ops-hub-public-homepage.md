# Ops Hub Public Homepage Before Sign-In

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `ops-hub`, `auth`, `homepage`, `ux`

## Objective

Add a public guest-facing homepage for the Ops Hub app so unauthenticated
visitors can understand what the app is, what operational problems it solves,
and why registration/sign-in is required before accessing the operator console.

## Background

When visiting the Ops Hub app directly at `http://localhost:3003/`, the current
flow redirects immediately to the portal sign-in page:

```text
http://localhost:3000/sign-in?callbackUrl=http%3A%2F%2Flocalhost%3A3003%2F
```

That protects the internal console, but it gives guests no app-specific context.
A first-time visitor should be able to see a concise public overview before
being asked to sign in.

The app on port `3003` maps to `apps/ops-hub`.

## Problem

- Guests see a sign-in wall before learning what Ops Hub is.
- The current redirect does not explain that Ops Hub is an internal SaaS
  operations console.
- There is no public CTA explaining why authentication and proper permissions
  are required.
- The app lacks a first-touch onboarding surface for operators, admins, or
  stakeholders evaluating the product.

## Proposed Experience

Unauthenticated users visiting `http://localhost:3003/` should see a public
homepage with:

- Clear product name and short explanation.
- Summary of the operational workflows Ops Hub supports:
  - tenant monitoring
  - subscription and billing visibility
  - user and customer lifecycle tracking
  - feature flag operations
  - automation monitoring
  - audit history
- Explanation that sign-in is required because the app contains business,
  customer, billing, and operational data.
- Primary CTA: sign in through the portal.
- Secondary CTA: return to portal or learn more.

Authenticated users with the right permissions should still land in the actual
Ops Hub console.

## Suggested Scope

### 1. Split Guest and Authenticated Home Behavior

- [ ] Update the root route or initial routing behavior in `apps/ops-hub`.
- [ ] If the user has a valid session and Ops Hub access, render the current
      authenticated console flow.
- [ ] If the user is unauthenticated, render a public guest homepage instead of
      immediately redirecting to sign-in.
- [ ] If the user is authenticated but lacks `ops_viewer`, `ops_admin`, or
      `superadmin`, continue showing the existing restricted-access experience.
- [ ] Keep all operator data, APIs, and mutations protected.

### 2. Create Public Homepage Content

- [ ] Add a guest homepage section explaining what Ops Hub is.
- [ ] Explain the value of a central operator console:
  - spot at-risk tenants
  - inspect subscription health
  - manage rollout safely
  - monitor automations
  - review audit history
- [ ] Add a clear message that registration/sign-in is required because the
      console contains private operational data.
- [ ] Include a concise CTA to sign in through the portal.

### 3. CTA and Auth Flow

- [ ] Add primary CTA to the portal sign-in/register flow.
- [ ] Preserve callback behavior so users return to `http://localhost:3003/`
      after authentication.
- [ ] Confirm local callback URL behavior works with:

```text
http://localhost:3000/sign-in?callbackUrl=http%3A%2F%2Flocalhost%3A3003%2F
```

### 4. Design Requirements

- [ ] Use the existing Ops Hub visual language and shared UI patterns.
- [ ] Keep the page operational and product-focused, not a generic marketing
      page.
- [ ] Make the product purpose visible in the first viewport.
- [ ] Avoid exposing tenant, billing, user, feature flag, automation, or audit
      data to guests.
- [ ] Ensure the mobile layout is clean and CTAs remain visible.

### 5. Tests and Verification

- [ ] Verify guest visit to `http://localhost:3003/` shows the public homepage.
- [ ] Verify CTA sends user to portal sign-in/register.
- [ ] Verify successful auth returns user to Ops Hub.
- [ ] Verify authenticated users with Ops Hub permissions see the console.
- [ ] Verify authenticated users without Ops Hub permissions see the restricted
      access state.
- [ ] Verify protected APIs still return unauthorized/forbidden for guests and
      unauthorized users.

## Acceptance Criteria

- [ ] Guests can view a public Ops Hub homepage without signing in.
- [ ] The homepage explains what Ops Hub does and why sign-in is required.
- [ ] Registration/sign-in CTA preserves the callback URL back to the app.
- [ ] Authorized users still see the existing operator console.
- [ ] Unauthorized authenticated users still see the restricted-access flow.
- [ ] No tenant, billing, user, feature flag, automation, or audit data is
      exposed to unauthenticated users.
- [ ] The issue is implemented without weakening route/API protection.

## Notes

This should be treated as a product onboarding improvement, not a request to
make the Ops Hub console public. The console and all operational data must remain
authenticated and permission-gated.
