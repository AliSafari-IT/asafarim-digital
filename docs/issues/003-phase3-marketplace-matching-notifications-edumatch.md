# Phase 3 — EduMatch Marketplace + Matching + Notifications

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `matching`, `notifications`, `admin`

## Objective
Implement Phase 3 of the EduMatch project: tutor ranking/matching algorithm, notification system for tutors when quote requests are created, admin debug view for matching, and Flutter tutor app for mobile quote submission.

## Background
Phase 2 (Inquiry + AI + Quotes) is complete:
- ✅ Student inquiry intake form with multi-step UI
- ✅ AI streaming responses via SSE
- ✅ Quote request and submission APIs
- ✅ Student quote review and acceptance UI
- ✅ Tutor dashboard quote requests page
- ✅ PostGIS nearby tutor matching implemented

## Tasks

### 1. Tutor Matching Algorithm Refinement ⚠ to implement
**File:** `apps/edumatch/lib/server/tutor-matching.ts`

The nearby tutor matching is already implemented with `ST_DWithin`, but needs a ranking algorithm:
- **Ranking signals:**
  - Distance (PostGIS `ST_Distance` in meters)
  - Rating (tutor's `ratingAvg` × `ratingCount` weight)
  - Price tier (student's budget vs tutor's `hourlyRateCents`)
  - Online-only fit (if student prefers online, prioritize `onlineOnly=true`)
  - Subject/level match score (exact match > partial match)
- **Output:** Return up to 5 ranked tutors with match scores
- **API endpoint:** `GET /api/tutors/nearby?subject=...&gradeLevel=...&lat=...&lng=...` (already exists, needs ranking logic)

```typescript
// Expected response format
{
  items: [{
    tutorId: string;
    name: string;
    ratingAvg: number;
    ratingCount: number;
    hourlyRateCents: number;
    distanceKm: number;
    matchScore: number; // 0-100
  }];
}
```

### 2. Notification System ⚠ to implement
**Files:**
- `apps/edumatch/lib/server/notifications.ts` — new file
- `apps/edumatch/app/api/notifications/route.ts` — new file

When a student creates a quote request, notify matched tutors:
- **Notification types:**
  - `QUOTE_REQUEST_CREATED` — sent to nearby tutors when quote request created
  - `QUOTE_SUBMITTED` — sent to student when tutor submits a quote
  - `QUOTE_ACCEPTED` — sent to tutor when student accepts their quote
  - `BOOKING_CONFIRMED` — sent to both parties when booking is confirmed
- **Delivery channels:**
  - In-app notification (stored in `EduNotification` table)
  - Email (via Resend API)
- **API endpoints:**
  - `GET /api/notifications` — list user notifications
  - `POST /api/notifications/{id}/mark-read` — mark notification as read
  - `POST /api/notifications/{id}/dismiss` — dismiss notification

### 3. Admin Debug View for Matching ⚠ to implement
**File:** `apps/edumatch/app/admin/tutor-matching/page.tsx` — new file

Admin-only page to debug tutor matching:
- Input: subject, grade level, student location (lat/lng)
- Output: ranked list of tutors with match scores, distance, rating
- Show raw PostGIS query results
- Allow manual override of matching parameters (max distance, weight tuning)
- Requires `edumatch_admin` role (add to RBAC seed)

### 4. Flutter Tutor App (Mobile) ⚠ to implement
**Repository:** New Flutter app repo (e.g., `asafarim-edumatch-tutor`)

Mobile app for tutors to:
- View incoming quote requests
- Submit quotes on-the-go
- Manage availability calendar
- View bookings and student messages
- Receive push notifications for new quote requests

**Minimum Viable Features:**
- Sign in with Google (shared auth with web)
- Quote requests list with filters
- Quote submission form (rate, hours, slots)
- Booking management
- Push notifications (Firebase Cloud Messaging)

**Tech Stack:**
- Flutter 3.x
- Provider/Riverpod for state management
- Firebase Cloud Messaging for push
- Shared API endpoints with web app

### 5. Email Templates ⚠ to implement
**File:** `apps/edumatch/lib/emails/` — new directory

Create email templates for:
- `quote-request-created.html` — sent to tutors
- `quote-submitted.html` — sent to students
- `quote-accepted.html` — sent to tutors
- `booking-confirmed.html` — sent to both parties

Use Handlebars templates (already installed as dependency) and render via Resend.

### 6. Rate Limiting & Spam Prevention ⚠ to implement
**File:** `apps/edumatch/lib/server/rate-limit.ts` — new file

Prevent abuse:
- Rate limit quote request creation (max 3 per hour per student)
- Rate limit quote submission (max 10 per hour per tutor)
- CAPTCHA for public inquiry creation (if opened to unauthenticated users)
- IP-based throttling for API endpoints

## Acceptance Criteria
- [ ] Tutor matching returns ranked results with match scores
- [ ] Notifications are sent to tutors when quote requests are created
- [ ] Students receive email notifications for quote submissions
- [ ] Admin debug view shows matching results with scores
- [ ] Flutter tutor app MVP is deployed to TestFlight/Play Store Internal
- [ ] Email templates render correctly with dynamic data
- [ ] Rate limiting prevents spammy behavior
- [ ] All new endpoints are TypeScript-typed and Zod-validated

## Technical Notes
- **PostGIS queries:** Use `$queryRaw` for spatial calculations. The extension is already enabled in migrations.
- **Notification delivery:** Use a job queue (BullMQ + Redis) for async email sending to avoid blocking request threads.
- **Flutter auth:** Use the same NextAuth session — share JWT cookies or use OAuth2 code flow with redirect back to mobile.
- **Email templates:** Store in `apps/edumatch/lib/emails/` and compile with Handlebars at runtime.
- **Rate limiting:** Use Upstash Redis or in-memory rate limiting for development.

## Related Files
- `apps/edumatch/lib/server/tutor-matching.ts` — nearby tutor matching (exists, needs ranking)
- `apps/edumatch/lib/server/notifications.ts` — notification service (to create)
- `apps/edumatch/app/api/tutors/nearby/route.ts` — nearby tutor search (exists)
- `apps/edumatch/app/api/inquiries/[id]/quote-request/route.ts` — quote request creation
- `apps/edumatch/app/api/quote-requests/[id]/quotes/route.ts` — quote submission
- `packages/db/prisma/schema.prisma` — `EduNotification`, `EduBooking` models
- `apps/edumatch/lib/server/validation.ts` — Zod schemas

## Environment Variables Required
| Variable | Used by |
|---|---|
| `RESEND_API_KEY` | Email notifications |
| `NEXT_PUBLIC_RESEND_FROM_EMAIL` | Email from address |
| `REDIS_URL` | BullMQ job queue |
| `FIREBASE_PROJECT_ID` | Flutter push notifications |
| `FIREBASE_SERVER_KEY` | Flutter push notifications |

## Estimated Effort
2–3 weeks

## Blockers
- Phase 2 quote flow must be fully tested and working
- Redis server must be available for job queue
- Firebase project must be set up for Flutter push notifications
