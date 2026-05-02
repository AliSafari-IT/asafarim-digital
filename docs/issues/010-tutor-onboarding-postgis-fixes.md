# Fix Tutor Onboarding, PostGIS Dependencies, and Missing Pages

**Date:** 2026-05-03  
**Status:** Completed

## Summary
Fixed multiple issues in the tutor onboarding flow, resolved PostGIS dependencies by migrating to Haversine distance calculations, and created missing tutor pages.

## Issues Fixed

### 1. Tutor Onboarding - "Complete Verification" Button Not Working
**Problem:** Clicking "Complete Verification" on `/tutor/connect/onboard` did nothing, even with `STRIPE_MOCK_MODE=true`.

**Root Cause:** When a tutor already had a `stripeAccountId`, the API returned `alreadyOnboarded: true` without a redirect URL. The frontend had no path to proceed.

**Solution:**
- Modified `app/api/tutors/connect/onboard/route.ts` to return a redirect URL in mock mode even when account exists
- Redirects to `/tutor/connect/success?mock=onboarding_complete&account=...`

**Files Changed:**
- `apps/edumatch/app/api/tutors/connect/onboard/route.ts`

---

### 2. Tutor Navbar Items Not Showing
**Problem:** Seeded tutor navbar items didn't appear for authenticated tutors.

**Root Cause:** The `edumatch_tutor` role is only assigned when `upsertTutorProfile` is called. If a user had the role in DB but session JWT was stale, the role wouldn't appear in `user.roles`.

**Solution:**
- Added auto-assign role check in `requireTutor()` to ensure role is always in sync with profile existence
- Users can click "Refresh session" in user menu to update their JWT with current roles

**Files Changed:**
- `apps/edumatch/lib/server/profiles.ts`

---

### 3. Tutor Requests Page - Location Error (PostGIS Not Installed)
**Problem:** `/tutor/requests` returned 500 error: `ERROR: type "geography" does not exist`

**Root Cause:** Code used PostGIS `ST_DWithin`, `ST_Distance`, `ST_MakePoint` functions on a `homeLocation` geography column that doesn't exist. The schema uses plain `homeLat`/`homeLng` Float columns (PostGIS not installed per schema comment).

**Solution:** 
- Replaced raw PostGIS SQL with Prisma queries + JavaScript Haversine distance calculation
- Updated `listAvailableQuoteRequestsForTutor` to use `homeLat`/`homeLng` columns
- Added `haversineKm()` helper function

**Files Changed:**
- `apps/edumatch/lib/server/quotes.ts`

---

### 4. Tutor Matching - PostGIS Dependencies
**Problem:** `tutor-matching.ts` had the same PostGIS dependencies and would crash on any tutor-matching API call.

**Root Cause:** Same as #3 — used PostGIS functions on non-existent `homeLocation` column.

**Solution:**
- Replaced all PostGIS queries with Haversine-based approach
- Updated `findNearbyTutors`, `canTutorServiceLocation`, `updateTutorLocation`
- Added `haversineKm()` helper

**Files Changed:**
- `apps/edumatch/lib/server/tutor-matching.ts`

---

### 5. Quote Submission - Invalid Datetime Validation
**Problem:** Submitting a quote returned `availabilitySlots.0.start: Invalid datetime; availabilitySlots.0.end: Invalid datetime`

**Root Cause:** `z.string().datetime()` requires full ISO 8601 with seconds and timezone (e.g., `2026-05-03T14:30:00.000Z`), but `datetime-local` input produces `2026-05-03T14:30` without seconds or timezone.

**Solution:**
- Added `isoOrLocalDatetime` Zod transformer that accepts both formats
- Normalizes datetime-local strings to full ISO strings before validation

**Files Changed:**
- `apps/edumatch/app/api/quote-requests/[id]/quotes/route.ts`

---

### 6. Missing Tutor Pages (404 Errors)
**Problem:** Navbar links to `/tutor/quotes`, `/tutor/bookings`, `/tutor/earnings`, `/tutor/settings` returned 404.

**Solution:** Created all missing pages and their API routes:
- `/tutor/quotes` — lists submitted quotes with status grouping
- `/tutor/bookings` — lists upcoming and completed sessions
- `/tutor/earnings` — balance, payout history, transactions
- `/tutor/settings` — hourly rate, online-only toggle, service radius

**Files Created:**
- `apps/edumatch/app/tutor/quotes/page.tsx`
- `apps/edumatch/app/tutor/bookings/page.tsx`
- `apps/edumatch/app/tutor/earnings/page.tsx`
- `apps/edumatch/app/tutor/settings/page.tsx`
- `apps/edumatch/app/api/tutors/quotes/route.ts`
- `apps/edumatch/app/api/tutors/bookings/route.ts`

---

### 7. Student Quotes Page - "No quote request found"
**Problem:** `/student/inquiry/[id]/quotes` showed "No quote request found" even after requesting quotes.

**Root Cause:** The "View Quotes" link didn't include the `?qr=` query param, and the page couldn't auto-resolve the quote request ID.

**Solution:**
- Added GET handler to `/api/inquiries/[id]/quote-request` to return the most recent quote request
- Updated "View Quotes" link to include `?qr=${quoteRequestId}` when available
- Modified quotes page to auto-resolve quoteRequestId via API when `?qr` param is missing

**Files Changed:**
- `apps/edumatch/app/api/inquiries/[id]/quote-request/route.ts` (added GET)
- `apps/edumatch/app/student/inquiry/[id]/page.tsx` (link fix)
- `apps/edumatch/app/student/inquiry/[id]/quotes/page.tsx` (auto-resolve)

---

## Technical Debt / TODOs

1. **PostGIS Migration:** When PostGIS is installed on the database, consider migrating back to `ST_DWithin` for better performance on large datasets. The Haversine approach loads all tutors into memory and filters in JS, which won't scale to thousands of tutors.

2. **Tutor Profile Location Update:** The `updateTutorLocation` function now writes to `homeLat`/`homeLng` instead of `homeLocation`. Ensure any existing geocoding flows are updated to use these columns.

3. **Session Refresh UX:** Consider making the "Refresh session" action more discoverable or auto-refreshing when role mismatch is detected.

---

## Testing Checklist

- [x] Tutor onboarding works with `STRIPE_MOCK_MODE=true`
- [x] Tutor navbar items appear after session refresh
- [x] `/tutor/requests` loads with browser geolocation fallback
- [x] Quote submission accepts datetime-local format
- [x] All tutor pages load without 404
- [x] Student quotes page loads and displays quotes
- [x] "View Quotes" link includes `?qr=` param

---

## Related Schema Notes

Per `packages/db/prisma/schema.prisma`:
```prisma
// Geo fields temporarily use simple lat/lng Float columns (PostGIS not installed).
// TODO: Revert to PostGIS geography once PostGIS is available on the database.
```

The changes in this session align with the schema's current limitations. Once PostGIS is enabled, a migration back to spatial queries should be considered.
