# Marketing Content Public Homepage Before Sign-In

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `marketing-content`, `auth`, `homepage`, `ux`

## Objective

Add a public guest-facing homepage for the Marketing Content app so
unauthenticated visitors can understand what the app is, what marketing and
growth workflows it supports, and why registration/sign-in is required before
accessing the authenticated workspace.

## Background

When visiting the Marketing Content app directly at `http://localhost:3004/`,
the current flow redirects immediately to the portal sign-in page:

```text
http://localhost:3000/sign-in?callbackUrl=http%3A%2F%2Flocalhost%3A3004%2F
```

That protects the app, but it gives guests no app-specific context. A first-time
visitor should be able to see a concise public overview before being asked to
sign in.

The app on port `3004` maps to `apps/marketing-content`.

## Problem

- Guests see a sign-in wall before learning what Marketing Content is.
- The current redirect does not explain the app value proposition.
- There is no public CTA explaining why authentication is needed.
- The app lacks a first-touch onboarding surface for marketers, operators, or
  stakeholders evaluating the product.

## Proposed Experience

Unauthenticated users visiting `http://localhost:3004/` should see a public
homepage with:

- Clear product name and short explanation.
- Summary of marketing/growth workflows the app supports:
  - campaign planning
  - content calendar and content assets
  - SEO visibility
  - lead tracking
  - automation monitoring
  - analytics and performance review
- Explanation that sign-in is required to access saved campaigns, content plans,
  lead data, automations, and analytics.
- Primary CTA: sign in or register through the portal.
- Secondary CTA: return to portal or view example use cases.

Authenticated users should still land in the actual Marketing Content workspace.

## Suggested Scope

### 1. Split Guest and Authenticated Home Behavior

- [ ] Update the root route or initial routing behavior in
      `apps/marketing-content`.
- [ ] If the user has a valid session, render the current authenticated
      Marketing Content app.
- [ ] If the user is unauthenticated, render a public guest homepage instead of
      immediately redirecting to sign-in.
- [ ] Keep all app data, future campaign records, leads, automations, and
      analytics protected.

### 2. Create Public Homepage Content

- [ ] Add a guest homepage section explaining what Marketing Content is.
- [ ] Explain the value of a central marketing operations surface:
  - plan campaigns
  - organize content work
  - track SEO opportunities
  - monitor lead flow
  - coordinate automations
  - review performance signals
- [ ] Add example use cases:
  - launch campaign planning
  - weekly content calendar
  - SEO content backlog
  - lead follow-up workflow
  - campaign performance review
- [ ] Add a clear "Register to try it" or "Sign in to start planning" CTA.

### 3. CTA and Auth Flow

- [ ] Add primary CTA to the portal sign-in/register flow.
- [ ] Preserve callback behavior so users return to `http://localhost:3004/`
      after authentication.
- [ ] Confirm local callback URL behavior works with:

```text
http://localhost:3000/sign-in?callbackUrl=http%3A%2F%2Flocalhost%3A3004%2F
```

### 4. Design Requirements

- [ ] Use the existing Marketing Content visual language and shared UI patterns.
- [ ] Keep the page product-focused, not a generic marketing landing page.
- [ ] Make the app value visible in the first viewport.
- [ ] Avoid exposing private campaign, lead, automation, or analytics data to
      guests.
- [ ] Ensure the mobile layout is clean and CTAs remain visible.

### 5. Tests and Verification

- [ ] Verify guest visit to `http://localhost:3004/` shows the public homepage.
- [ ] Verify CTA sends user to portal sign-in/register.
- [ ] Verify successful auth returns user to Marketing Content.
- [ ] Verify authenticated users see the app workspace.
- [ ] Verify protected APIs/routes still return unauthorized for guests.

## Acceptance Criteria

- [ ] Guests can view a public Marketing Content homepage without signing in.
- [ ] The homepage explains what Marketing Content does and why sign-in is
      required.
- [ ] Registration/sign-in CTA preserves the callback URL back to the app.
- [ ] Authenticated users still see the existing app workspace.
- [ ] No private campaign, content, SEO, lead, automation, or analytics data is
      exposed to unauthenticated users.
- [ ] The issue is implemented without weakening route/API protection.

## Notes

This should be treated as a product onboarding improvement, not a request to make
the authenticated Marketing Content workspace public. The current app uses static
demo data, but the homepage should still establish the correct protection model
for future persisted campaign, lead, automation, and analytics data.
