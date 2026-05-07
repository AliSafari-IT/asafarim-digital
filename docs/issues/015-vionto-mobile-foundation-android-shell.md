# Vionto Mobile Issue 1 - Android App Foundation

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `vionto`, `mobile`, `android`, `foundation`, `production`

## Objective

Create the Android/mobile foundation for Vionto so the product can support a mobile-first photo-to-story workflow while staying aligned with the existing ASafariM monorepo.

## Source Review Notes

- `apps/vionto` currently exists as a Next.js web shell on port `3006`.
- There is no dedicated Vionto Android shell or mobile workspace yet.
- The workspace already has `apps/mobile-next`, but Vionto-specific mobile ownership and routing are not defined.
- Shared package candidates already exist in `packages/auth`, `packages/db`, `packages/ui`, `packages/types`, `packages/shared-i18n`, and `packages/country-language-selector`.

## Scope

- [ ] Decide whether Vionto mobile lives inside `apps/mobile-next` or a dedicated `apps/vionto-mobile` app.
- [ ] Define the mobile build/runtime target: Android WebView shell, Expo/React Native, or native Android wrapper.
- [ ] Add Vionto mobile package scripts and workspace registration.
- [ ] Define mobile environment variables for API base URL, auth callback URL, upload limits, and feature flags.
- [ ] Add health/about screen that reports app version, API endpoint, and environment.
- [ ] Add a mobile route map for upload, script, audio, preview, export, account, and settings.

## Acceptance Criteria

- Vionto mobile can be started from a documented root command.
- The chosen mobile app path is explicit in README/project docs.
- The mobile shell has a production-safe env contract.
- Android local build/run instructions exist.
- No Vionto mobile code duplicates auth, i18n, or type definitions already available in shared packages.

## Test Plan

- Run the mobile start command.
- Verify app boots on Android emulator or documented fallback.
- Verify env validation fails clearly when required API URLs are missing.
- Add CI placeholder for the selected mobile build target.
