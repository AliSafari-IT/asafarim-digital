# Phase 2 — EduMatch Inquiry Flow, AI Responses & Quote Pipeline

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `ai`, `quotes`, `ui`

## Objective
Implement Phase 2 of the EduMatch project: the end-to-end student inquiry workflow including the intake form UI, AI-assisted responses (OpenAI streaming), tutor quote requests, and the student-facing quote acceptance flow leading to a confirmed booking.

## Background
Phase 1 (Foundations) is complete:
- ✅ Database migrations and seed data applied
- ✅ `EduStudentProfile` / `EduTutorProfile` APIs with RBAC role assignment
- ✅ Homepage role-based CTAs working (`edumatch_student` / `edumatch_tutor`)
- ✅ Backend inquiry and quote route stubs exist — need UI and wiring

## Tasks

### 1. Student Inquiry Intake Form UI ⚠ to implement
**File:** `apps/edumatch/app/student/inquiry/new/page.tsx`

Build a multi-step intake form at `/student/inquiry/new`:
- **Step 1 — Subject & Grade:** dropdown for subject + grade level selector
- **Step 2 — Description:** rich textarea (min 20 chars) with character counter
- **Step 3 — Attachments (optional):** drag-and-drop file upload via presign endpoint (`POST /api/uploads/presign`)
  - Accepted types: `image/*`, `audio/*`, `application/pdf`
  - Max size: 10 MB per file, 5 files
- **Step 4 — Review & Submit:** preview before POSTing to `POST /api/inquiries`

Validation schema is already defined: `inquiryIntakeSchema` in `apps/edumatch/lib/server/validation.ts`.

```typescript
// Expected POST body (from inquiryIntakeSchema)
{
  subject: string;          // min 2, max 50
  gradeLevel: string;       // "K12" | "UNDERGRAD" | "GRAD"
  description: string;      // min 20, max 5000
  attachments?: Array<{ type, url, mime, sizeBytes }>;
}
```

### 2. Inquiry Detail Page with AI Streaming ⚠ to implement
**File:** `apps/edumatch/app/student/inquiry/[id]/page.tsx`

Create a detail page at `/student/inquiry/[id]`:
- Render inquiry metadata (subject, grade, description, attachments)
- Display status badge (NEW / AI_RESPONDED / TUTOR_REQUESTED / BOOKED / CLOSED)
- "Ask AI" button — triggers SSE stream from `GET /api/inquiries/[id]/ai?stream=1`
  - Show streaming tokens in real-time as the AI types
  - Disable button while streaming; show spinner
  - On completion: persist response + show full explanation
- "Request Tutor Quotes" button — visible after `AI_RESPONDED` status
  - POSTs to `POST /api/inquiries/[id]/quote-request`

The AI streaming backend is already implemented at `apps/edumatch/app/api/inquiries/[id]/ai/route.ts`.

### 3. Tutor Quote Request & Quote Submission Flow ⚠ to implement
**Files:**
- `apps/edumatch/app/api/inquiries/[id]/quote-request/route.ts` — currently a stub
- `apps/edumatch/app/api/tutors/quote-requests/route.ts` — currently a stub

#### 3a. Quote Request API (student side)
`POST /api/inquiries/[id]/quote-request`
- Requires `edumatch_student` role
- Creates `EduQuoteRequest` with `expiresAt = now + 48h`
- Transitions inquiry status → `TUTOR_REQUESTED`
- Creates `EduNotification` for matched nearby tutors

#### 3b. Tutor Quote Requests List API
`GET /api/tutors/quote-requests`
- Requires `edumatch_tutor` role
- Returns open `EduQuoteRequest` rows that match tutor's `subjectsTaught`/`levelsTaught`
- Excludes requests the tutor already quoted on (`@@unique([quoteRequestId, tutorId])` prevents dupes)

#### 3c. Tutor Quote Submission
`POST /api/quote-requests/[id]/quotes` *(new route)*
- Requires `edumatch_tutor` role
- Body: `{ hourlyRateCents, estimatedHours, availabilitySlots, notes? }`
- Creates `EduQuote` row; status starts as `PENDING` → set to `SENT`

### 4. Student Quote Review & Acceptance UI ⚠ to implement
**File:** `apps/edumatch/app/student/inquiry/[id]/quotes/page.tsx`

- List all `EduQuote` records for the inquiry's quote request
- Each card shows: tutor name, rating, bio excerpt, rate, estimated hours, total cost, availability slots
- "Accept Quote" button → `POST /api/quotes/[id]/accept`
  - Creates `EduBooking` (status `SCHEDULED`)
  - Declines all other quotes for the same request
  - Transitions inquiry → `BOOKED`
- "Decline" button → `POST /api/quotes/[id]/decline`

Quote accept/decline backends are already implemented at:
- `apps/edumatch/app/api/quotes/[id]/accept/route.ts`
- `apps/edumatch/app/api/quotes/[id]/decline/route.ts`

### 5. Tutor Dashboard: Quote Requests Tab ⚠ to implement
**File:** `apps/edumatch/app/tutor/requests/page.tsx`

Currently the Tutor Dashboard links to `/tutor/requests` but the page doesn't exist.
- Fetch `GET /api/tutors/quote-requests`
- Card per request: subject, grade level, student grade level, description excerpt, expiry countdown
- "Submit Quote" inline form: rate, hours, notes, availability slots picker
- After submission: move card to "Quoted" section

### 6. Wire up TODO in Inquiry POST ⚠ to implement
**File:** `apps/edumatch/app/api/inquiries/route.ts` line 28

```typescript
// TODO(Phase 2.2): enqueue AI orchestrator job here.
```

After inquiry creation, automatically trigger AI response in background:
- Option A: Fire-and-forget `fetch` to the AI SSE route (simplest for single-server deploy)
- Option B: Use a job queue (`apps/edumatch/app/api/inquiries/[id]/ai/job/route.ts` already stubbed)

Implement Option A for now; document Option B as future work.

## Acceptance Criteria
- [ ] Student can create an inquiry via the multi-step intake form
- [ ] AI response streams in real-time on the inquiry detail page
- [ ] Student can trigger a tutor quote request after AI responds
- [ ] Tutors see open quote requests on their dashboard
- [ ] Tutors can submit a quote with rate + availability
- [ ] Student can view and accept/decline quotes
- [ ] Accepted quote creates a confirmed `EduBooking`
- [ ] All new routes are TypeScript-typed and Zod-validated
- [ ] No direct Prisma calls in route files (use helper functions in `lib/server/`)

## Technical Notes
- **AI Streaming:** Use `ReadableStream` + SSE headers (`Content-Type: text/event-stream`). The backend already handles this; the UI just needs an `EventSource` or `fetch` with `getReader()`.
- **OpenAI env vars:** `OPENAI_API_KEY`, `OPENAI_MODEL_CHAT` (default `gpt-4o-mini`), `OPENAI_MODEL_VISION` (default `gpt-4o`) must be set in `apps/edumatch/.env`.
- **PostGIS:** Nearby tutor matching uses `$queryRaw` with `ST_DWithin`. The PostGIS extension must be enabled (`CREATE EXTENSION IF NOT EXISTS postgis;` — already in migrations).
- **File uploads:** Presign endpoint (`POST /api/uploads/presign`) must have `S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` configured.
- Use `requireStudent()` / `requireTutor()` from `apps/edumatch/lib/server/profiles.ts` for all role guards.

## Related Files
- `apps/edumatch/app/api/inquiries/route.ts` — inquiry CRUD
- `apps/edumatch/app/api/inquiries/[id]/ai/route.ts` — AI SSE streaming (complete)
- `apps/edumatch/app/api/inquiries/[id]/ai/job/route.ts` — background job stub
- `apps/edumatch/app/api/inquiries/[id]/quote-request/route.ts` — stub to implement
- `apps/edumatch/app/api/quotes/[id]/accept/route.ts` — accept flow (complete)
- `apps/edumatch/app/api/quotes/[id]/decline/route.ts` — decline flow (complete)
- `apps/edumatch/app/api/quotes/[id]/checkout/route.ts` — Stripe checkout (Phase 3)
- `apps/edumatch/app/api/tutors/nearby/route.ts` — PostGIS tutor search (complete)
- `apps/edumatch/app/api/tutors/quote-requests/route.ts` — stub to implement
- `apps/edumatch/app/api/tutors/wallet/route.ts` — wallet balance (Phase 3)
- `apps/edumatch/lib/server/validation.ts` — Zod schemas
- `apps/edumatch/lib/server/inquiries.ts` — inquiry helpers
- `apps/edumatch/lib/server/quotes.ts` — quote helpers
- `apps/edumatch/lib/server/ai-orchestrator.ts` — OpenAI streaming helpers
- `packages/db/prisma/schema.prisma` — `EduInquiry`, `EduAiResponse`, `EduQuoteRequest`, `EduQuote`, `EduBooking`

## Environment Variables Required
| Variable | Used by |
|---|---|
| `OPENAI_API_KEY` | AI streaming |
| `OPENAI_MODEL_CHAT` | gpt-4o-mini (text) |
| `OPENAI_MODEL_VISION` | gpt-4o (image/audio) |
| `S3_BUCKET` | File upload presign |
| `AWS_REGION` | File upload presign |
| `AWS_ACCESS_KEY_ID` | File upload presign |
| `AWS_SECRET_ACCESS_KEY` | File upload presign |
| `GOOGLE_MAPS_API_KEY` | Geocoding (optional fallback) |

## Estimated Effort
3–5 days

## Blockers
- Phase 1 database migrations must be applied (`db:migrate` + `db:seed`)
- `OPENAI_API_KEY` must be configured in `apps/edumatch/.env` before testing AI streaming
