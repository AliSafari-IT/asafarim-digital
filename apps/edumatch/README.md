# EduMatch

AI-first homework help + tutor marketplace. Web and API live here as a single
Next.js 16 app inside the `asafarim-digital` monorepo. The Flutter mobile app
is intentionally out of scope and will live in a separate repo if/when needed.

See the full plan at [`docs/edumatch-project-plan.md`](../../docs/edumatch-project-plan.md).

## Status

**Phase 5 — PDF generation + email notifications (COMPLETE).**
Quote PDFs generated with Puppeteer + Handlebars, uploaded to DO Spaces with signed URLs.
Email notifications via Resend for inquiry received, AI response ready, quote received,
booking confirmed, and payout sent.

Previous phases:
- **Phase 4** — Stripe Connect onboarding, checkout, wallet, payouts
- **Phase 3** — Tutor matching with PostGIS geospatial queries, quote workflow
- **Phase 2** — AI orchestrator with streaming and BullMQ queue
- **Phase 1** — Multi-role auth, intake, file uploads

Endpoints:

**Intake & AI (Phase 2):**
- `POST /api/uploads/presign` — STUDENT-only. Validates filename, MIME, and size.
- `POST /api/inquiries` — STUDENT-only. Validates intake JSON, persists `EduInquiry`.
- `GET /api/inquiries` — STUDENT-only. Returns the caller's own inquiries.
- `GET /api/inquiries/[id]/ai?stream=1` — STUDENT-only. SSE streaming AI response.
- `POST /api/inquiries/[id]/ai/job` — STUDENT-only. Enqueue async AI job via BullMQ.

**Tutor Matching (Phase 3):**
- `GET /api/tutors/nearby?lat=&lng=&subject=&gradeLevel=` — STUDENT-only. PostGIS
  `ST_DWithin` query finds tutors within radius, scored by proximity/subject/rating.
- `POST /api/tutors/nearby` — Alternative with address geocoding.
- `GET /api/tutors/quote-requests` — TUTOR-only. List open requests matching expertise.

**Quotes (Phase 3):**
- `POST /api/inquiries/[id]/quote-request` — STUDENT-only. Create quote request,
  find matching tutors, transition inquiry → `TUTOR_REQUESTED`.
- `POST /api/quote-requests/[id]/quotes` — TUTOR-only. Submit standardized quote
  with `hourlyRateCents`, `estimatedHours`, `availabilitySlots`.
- `GET /api/quote-requests/[id]/quotes` — STUDENT-only. List quotes for request.
- `POST /api/quotes/[id]/accept` — STUDENT-only. Accept quote → creates booking.
- `POST /api/quotes/[id]/decline` — STUDENT-only. Decline quote.

**Payments (Phase 4):**
- `POST /api/tutors/connect/onboard` — TUTOR-only. Start Stripe Connect Express
  onboarding. Returns Stripe onboarding URL.
- `GET /api/tutors/connect/onboard` — Check onboarding status.
- `POST /api/quotes/[id]/checkout` — STUDENT-only. Create PaymentIntent for
  booking with 15% platform fee to EduMatch, 85% to tutor.
- `GET /api/tutors/wallet` — TUTOR-only. View wallet balance and transaction history.
- `POST /api/tutors/wallet/payout` — TUTOR-only. Request payout (min €50, 7-day cooldown).
- `POST /api/webhooks/stripe` — Public webhook handler for Connect events.

**PDFs & Email (Phase 5):**
- `POST /api/quotes/[id]/pdf` — STUDENT-only. Generate quote PDF with Puppeteer,
  upload to DO Spaces, return signed URL.
- `lib/server/email.ts` — Email service with Resend. Templates for all notification
  types: inquiry_received, ai_response_ready, quote_received, booking_confirmed,
  payout_sent.

Limits: 5 attachments × 50 MB each. Allowed MIME types: `image/{jpeg,png,webp,heic}`,
`video/{mp4,quicktime}`, `audio/{mp4,mpeg,wav,webm}`, `text/plain`, `application/pdf`.

Key modules:
- **AI** (`lib/server/ai-orchestrator.ts`): OpenAI primary, Anthropic failover,
  GPT-4o vision, Whisper transcription, SSE streaming, BullMQ queue.
- **Geocoding** (`lib/server/geocoding.ts`): Google Maps API for address → lat/lng.
- **Tutor Matching** (`lib/server/tutor-matching.ts`): PostGIS `ST_DWithin`,
  `ST_Distance`, scoring algorithm (proximity 30%, subject 25%, level 15%,
  rating 20%, verified 10%).
- **Quotes** (`lib/server/quotes.ts`): Quote request lifecycle, standardized
  quotes with availability slots, accept/decline flow.
- **Stripe** (`lib/server/stripe.ts`): Connect Express onboarding, PaymentIntents
  with split payments, payout handling, webhook verification.
- **Wallet** (`lib/server/wallet.ts`): Balance tracking, pending funds, payout
  scheduling (€50 min, 7-day cooldown).

**UI Pages:**
- `/student` — Student dashboard with inquiry list, status badges, "Ask Question" CTA.
- `/student/inquiry/new` — Intake form with subject, grade level, description.
- `/tutor` — Tutor dashboard with wallet balance, payout status, quote requests.
- Uses Tailwind CSS, Next.js App Router, Client Components for interactivity.

Configure via env:
```
# AI
OPENAI_API_KEY=sk-...
OPENAI_MODEL_VISION=gpt-4o
OPENAI_MODEL_CHAT=gpt-4o-mini
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379

# Geocoding
GOOGLE_MAPS_API_KEY=...

# Storage (Spaces/S3)
SPACES_ENDPOINT=...
SPACES_BUCKET=...
```

 The EduMatch domain
(`EduStudentProfile`, `EduTutorProfile`, `EduInquiry`, `EduAiResponse`,
`EduQuoteRequest`, `EduQuote`, `EduBooking`, `EduTransaction`, `EduWallet`,
`EduNotification`, `EduMessage`) lives in `packages/db/prisma/schema.prisma`.

Auth uses `@asafarim/auth` (NextAuth + Prisma). EduMatch *roles* are derived
at runtime:

- **STUDENT** — has an `EduStudentProfile` row.
- **TUTOR**   — has an `EduTutorProfile` row.
- **ADMIN**   — has the global `admin` or `superadmin` role from the shared
                RBAC tables. ADMIN satisfies any role check.

Server helpers in `lib/server/profiles.ts`:

- `getEduRoles(user)` → `EduRole[]`
- `requireRole("STUDENT" | "TUTOR" | "ADMIN", ...)` — throws `EduAuthError`
- `requireStudent()` / `requireTutor()` — return the resolved profile or throw
- `handleEduError(scope, error)` — maps `EduAuthError` to JSON 401/403, anything
  else to a logged 500 (see `lib/server/index.ts`).

`GET /api/me` is the canonical client probe — returns user id, RBAC roles,
and the resolved EduMatch roles.

AI, Stripe, and storage wiring land in later phases.

### Database bootstrap

EduMatch uses PostGIS for spatial queries (`Unsupported("geography(Point, 4326)")`).
Before the first `prisma db push`, enable the extension once:

```bash
psql "$DATABASE_URL" -f apps/edumatch/db/enable-postgis.sql
pnpm --filter @asafarim/db db:push
```

Spatial filters use `$queryRaw` with `ST_DWithin` — Prisma cannot type-check
`Unsupported` columns, which is fine for our use case.

## Local development

```bash
# from repo root
pnpm install
pnpm dev --filter edumatch
```

App: http://localhost:3005
Health: http://localhost:3005/api/health

## Layout

```
apps/edumatch/
├── app/
│   ├── api/
│   │   └── health/route.ts   # liveness probe
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # placeholder landing page
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── .env.example
```

## Roadmap (high-level)

| Phase | Scope |
|-------|-------|
| 0 | Skeleton, health check, env template *(current)* |
| 1.1 | Prisma schema additions in `packages/db`: users, profiles, inquiries, quotes, bookings, transactions, wallets |
| 1.2 | `@asafarim/auth` integration — STUDENT / TUTOR / ADMIN roles, 2FA for tutors |
| 1.3 | Profile CRUD + Google Maps geocoding |
| 2 | Intake API, presigned uploads, AI orchestrator (OpenAI primary, Anthropic failover), streaming |
| 3 | Tutor matching (PostGIS), quote requests, standardized quotes |
| 4 | Stripe Connect onboarding, booking checkout, wallet, payouts |
| 5 | Quote PDFs (Puppeteer), transactional email |
| 6 | Web UI polish (mobile app excluded) |
| 7 | E2E tests, deploy to `edumatch-qa.asafarim.com` |
