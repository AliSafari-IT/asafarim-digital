# Content Generator Public Homepage Before Sign-In

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `content-generator`, `auth`, `homepage`, `ux`

## Objective

Add a public guest-facing homepage for the Content Generator app so unauthenticated
visitors can understand what the app is, why it is useful, and why they should
register before trying the authenticated workspace.

## Background

When visiting the Content Generator app directly at `http://localhost:3001/`,
the current flow redirects immediately to the portal sign-in page:

```text
http://localhost:3000/sign-in?callbackUrl=http%3A%2F%2Flocalhost%3A3001%2F
```

That protects the app, but it creates a poor first impression for guests. A new
visitor sees a sign-in wall before learning what the Content Generator app does.
The app needs a public entry page that explains the product and then guides users
to register/sign in when they want to create content.

The request used the phrase "content-management app"; in the current repo and
local ports this maps to the `content-generator` app running on port `3001`.

## Problem

- Guests cannot see any app-specific information before authentication.
- The sign-in redirect does not explain the app value proposition.
- There is no public CTA path that says why registration is needed.
- The app lacks a marketing/onboarding surface for first-time users.

## Proposed Experience

Unauthenticated users visiting `http://localhost:3001/` should see a public
homepage with:

- Clear product name and short explanation.
- What the app helps users create.
- Why AI generation is organized into projects, prompts, and content types.
- Benefits of registering:
  - save generated content
  - organize drafts by project
  - keep chat/session history
  - create reusable prompts
  - create custom content types
  - access the authenticated workspace securely
- Primary CTA: register or sign in through the portal.
- Secondary CTA: learn more or view example use cases.

Authenticated users should still land in the actual Content Generator workspace.

## Suggested Scope

### 1. Split Guest and Authenticated Home Behavior

- [ ] Update the root route in `apps/content-generator/app/page.tsx`.
- [ ] If the user has a valid session, render the current authenticated workspace.
- [ ] If the user is unauthenticated, render a public guest homepage instead of
      immediately redirecting to sign-in.
- [ ] Keep protected API routes and user-owned data behind auth.

### 2. Create Public Homepage Content

- [ ] Add a guest homepage section explaining what Content Generator is.
- [ ] Explain key workflows:
  - generate production-ready copy
  - organize work by project
  - save prompts
  - customize content types
  - keep history across sessions
- [ ] Add example content categories:
  - blog posts
  - product pages
  - email campaigns
  - social posts
  - summaries
  - launch copy
- [ ] Add a clear "Register to try it" message.

### 3. CTA and Auth Flow

- [ ] Add primary CTA to the portal sign-in/register flow.
- [ ] Preserve callback behavior so users return to `http://localhost:3001/`
      after authentication.
- [ ] Confirm local callback URL behavior works with:

```text
http://localhost:3000/sign-in?callbackUrl=http%3A%2F%2Flocalhost%3A3001%2F
```

### 4. Design Requirements

- [ ] Use the existing Content Generator visual language and shared UI patterns.
- [ ] Keep the page product-focused, not a generic landing page.
- [ ] Make the app value visible in the first viewport.
- [ ] Avoid exposing private workspace data or API results to guests.
- [ ] Ensure mobile layout is clean and CTAs remain visible.

### 5. Tests and Verification

- [ ] Verify guest visit to `http://localhost:3001/` shows public homepage.
- [ ] Verify CTA sends user to portal sign-in/register.
- [ ] Verify successful auth returns user to the Content Generator workspace.
- [ ] Verify authenticated visit to `http://localhost:3001/` bypasses guest
      homepage and shows the app workspace.
- [ ] Verify protected APIs still return unauthorized for guests.

## Acceptance Criteria

- [ ] Guests can view a public Content Generator homepage without signing in.
- [ ] The homepage explains what the app does and why registration is needed.
- [ ] Registration/sign-in CTA preserves the callback URL back to the app.
- [ ] Authenticated users still see the existing workspace.
- [ ] No private content, projects, prompts, sessions, or generations are exposed
      to unauthenticated users.
- [ ] The issue is implemented without weakening route/API protection.

## Notes

This should be treated as a product onboarding improvement, not a request to make
the authenticated workspace public. The workspace, saved projects, prompts,
generation history, and content type management should remain authenticated.
