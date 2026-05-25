# EduMatch Project Plan

**Author:** Ali Safari
**Created:** 2026-04-27
**Updated:** 2026-05-25
**Status:** Phase 7 in progress
**Purpose:** Practice a production-shaped AI marketplace system inside the
ASafariM Digital monorepo.

## 1. Vision

EduMatch helps students move from confusion to booked help through one loop:

1. A student asks a homework question by typing, uploading a file, or describing
   the problem.
2. AI returns a clear explanation, study plan, and next-step guidance.
3. If the student wants human support, EduMatch matches nearby or online tutors.
4. Tutors send comparable quotes.
5. The student accepts a quote, pays through Stripe, and receives confirmation.
6. The tutor completes the booking and receives platform-managed earnings.

The product is intentionally small enough to ship but broad enough to practice
the hard parts: multi-role auth, AI orchestration, geospatial matching, payment
splits, PDF generation, transactional notifications, and a companion mobile app.

## 2. Current Implementation Snapshot

EduMatch is no longer planned as a separate Fastify/Supabase app. The current
implementation is a Next.js app in the ASafariM Digital monorepo:

- Web/API app: `apps/edumatch`
- Mobile companion: `apps/mobile`
- Shared database schema: `packages/db/prisma/schema.prisma`
- Shared auth: `@asafarim/auth`
- Shared navigation: `@asafarim/navigation`
- Shared UI/i18n packages: `@asafarim/ui`, `@asafarim/shared-i18n`

Completed capabilities:

- Student/tutor/admin role derivation.
- Student inquiry intake and upload presigning.
- AI response generation and streaming.
- Tutor profile setup, geocoding, and PostGIS-based matching.
- Quote requests, quote submission, quote comparison, accept/decline flow.
- Stripe Connect onboarding, checkout, wallet, payout request, and webhooks.
- Quote PDF generation and signed URLs.
- Resend email notifications.
- Student and tutor dashboards.
- Legal pages.
- API documentation page.
- Flutter mobile scaffold for the same domain.

## 3. Product Principles

- Ship the full learning loop before adding breadth.
- Keep every quote comparable: hourly rate, estimated hours, total, availability,
  and tutor note.
- Make AI helpful but not authoritative; education answers need uncertainty and
  review language.
- Keep money movement explicit and auditable.
- Prefer small regional MVP behavior over generic global marketplace complexity.
- Use shared monorepo primitives when they already exist.

## 4. Architecture

```text
Student/Tutor Web UI (Next.js)
          |
          v
EduMatch API routes (Next.js App Router)
          |
          +-- shared auth/session via @asafarim/auth
          +-- Prisma/Postgres via @asafarim/db
          +-- PostGIS tutor matching
          +-- OpenAI primary and Anthropic failover
          +-- BullMQ/Redis async jobs
          +-- DigitalOcean Spaces/S3 storage
          +-- Stripe Connect payments
          +-- Resend email notifications
          +-- Puppeteer/Handlebars PDFs

Flutter mobile app
          |
          v
Same EduMatch API surface
```

## 5. Data Model

Core EduMatch models live in `packages/db/prisma/schema.prisma`:

- `EduStudentProfile`: student preferences and grade/subject context.
- `EduTutorProfile`: subjects, levels, rates, location, service radius, Stripe
  status, rating metadata, and verification state.
- `EduInquiry`: student question, attachments, subject, level, status.
- `EduAiResponse`: explanation, study plan, model metadata, cost/latency.
- `EduQuoteRequest`: tutor matching request tied to an inquiry.
- `EduQuote`: tutor quote, availability, PDF URL, and status.
- `EduBooking`: accepted quote, payment intent, schedule, mode, and status.
- `EduTransaction`: booking charge, platform fee, tutor net, refunds, payouts.
- `EduWallet`: tutor balance, pending funds, payout threshold, cooldown state.
- `EduNotification`: in-app and email notification state.
- `EduMessage`: future in-app booking conversation thread.

Runtime roles:

- `STUDENT`: user has an `EduStudentProfile`.
- `TUTOR`: user has an `EduTutorProfile`.
- `ADMIN`: user has global `admin` or `superadmin` RBAC.

## 6. Milestones

### Phase 0 - Monorepo Setup (Complete)

Deliverables:

- Next.js app scaffold in `apps/edumatch`.
- Docker, health check, env template, and local dev scripts.
- Shared app conventions aligned with portal/content-generator/ops-hub.

### Phase 0.5 - Shared Infrastructure (Complete)

Deliverables:

- Shared payment package groundwork.
- Shared navigation types, resolver, API, and UI components.
- EduMatch roles and permissions seeded into the shared RBAC model.

### Phase 1 - Foundations (Complete)

Deliverables:

- Prisma schema additions for EduMatch domain models.
- Student/tutor/admin role helpers.
- Profile APIs and pages.
- PostGIS extension bootstrap.
- Google Maps geocoding helper.

### Phase 2 - Student Intake and AI (Complete)

Deliverables:

- Upload presigning with MIME, filename, and size validation.
- Inquiry creation/list/detail endpoints.
- AI orchestrator with OpenAI primary and Anthropic failover.
- Streaming AI response endpoint.
- Async AI job route using BullMQ.
- Student dashboard and inquiry detail UI.

### Phase 3 - Tutor Matching and Quotes (Complete)

Deliverables:

- PostGIS `ST_DWithin` matching by subject, level, rating, verification, and
  distance.
- Quote request creation from an inquiry.
- Tutor request inbox.
- Standard quote submission.
- Student quote comparison.
- Accept/decline lifecycle and booking creation.

### Phase 4 - Payments and Wallets (Complete)

Deliverables:

- Stripe Connect Express onboarding.
- PaymentIntent checkout with platform fee and tutor transfer destination.
- Booking confirmation status polling.
- Stripe webhook handling.
- Tutor wallet balance, pending funds, transaction history, and payout request.
- Minimum payout and cooldown checks.

### Phase 5 - PDFs and Notifications (Complete)

Deliverables:

- Quote PDF rendering with Puppeteer and Handlebars.
- Signed PDF URLs in S3-compatible storage.
- Resend notification service.
- Email templates for inquiry received, AI ready, quote received, booking
  confirmed, and payout sent.

### Phase 6 - Mobile Companion (Complete)

Deliverables:

- Flutter scaffold in `apps/mobile`.
- Riverpod, Dio, secure storage, Stripe, maps, media, and notification packages.
- Student and tutor screen skeletons.
- Shared models and API service.
- Role onboarding and sign-in screens.

### Phase 7 - Polish and Release Hardening (In Progress)

Goal: make the existing loop demonstrable end to end.

Deliverables:

- API integration tests for inquiries, AI jobs, quotes, checkout, wallet, and
  Stripe webhooks.
- Playwright E2E coverage for student inquiry, quote acceptance, and tutor quote
  submission.
- Seed data that can drive a complete demo without manual database edits.
- Accessibility pass on dashboards, forms, modals, and status messages.
- Lighthouse pass for public and authenticated web surfaces.
- Mobile real-device checks for iOS and Android.
- QA deployment to `edumatch-qa.asafarim.com`.
- Internal TestFlight and Play Console tracks.

Acceptance criteria:

- A fresh database seed supports a complete student/tutor demo.
- A student can create an inquiry, receive AI help, request tutors, accept a
  quote, pay, and view confirmation.
- A tutor can onboard, see matching requests, submit a quote, see booking state,
  and view wallet impact.
- Failed AI/payment/email paths show clear user and operator feedback.

### Phase 8 - Trust, Safety, and Quality Controls

Goal: make EduMatch safer for education and payments.

Deliverables:

- AI answer disclaimer and confidence UI.
- Prompt/output moderation for unsafe academic integrity requests.
- Tutor verification checklist and admin review state.
- Booking cancellation and refund policy states.
- Basic dispute intake form.
- Notification preference center.
- Audit events for quote, booking, payout, and admin actions.

### Phase 9 - Learning Experience Upgrade

Goal: turn one-off answers into study progress.

Deliverables:

- Saved study plans.
- Practice problem generator.
- "Explain another way" and "quiz me" follow-up actions.
- Subject progress dashboard.
- Tutor handoff summary that includes the AI attempt and student confusion
  points.
- PDF study packet export.

### Phase 10 - Marketplace Growth

Goal: make tutor supply and demand manageable.

Deliverables:

- Tutor availability calendar.
- Online/in-person preference filters.
- Quote expiry and reminder automation.
- Tutor response time and acceptance metrics.
- Ratings after completed bookings.
- Admin matching dashboard with reason codes and override tools.

## 7. Release Plan

1. Local demo release: seeded demo loop, no external beta users.
2. QA release: deployed web app, test-mode Stripe only, invited internal users.
3. Mobile internal release: TestFlight/Play Console internal tracks pointed at QA.
4. Closed pilot: 5 to 10 known testers, one region, test payments only unless a
   real compliance decision is made.
5. Portfolio release: screenshots, architecture notes, and demo script, with
   private data removed.

## 8. Testing Plan

- Unit tests for validation, role helpers, matching score, quote lifecycle, and
  wallet invariants.
- API integration tests for auth gating, ownership checks, and status
  transitions.
- Stripe webhook tests with replay/idempotency cases.
- Playwright tests for student and tutor happy paths.
- Mobile widget tests for role onboarding and critical forms.
- Manual QA scripts for email, PDF, and storage URLs.

## 9. Operational Risks

- AI answers can be wrong. Mitigation: disclaimer, moderation, answer review
  language, and tutor handoff.
- Stripe Connect has real compliance constraints. Mitigation: keep pilot in test
  mode until the compliance path is explicit.
- Wallet accounting bugs are high impact. Mitigation: append-only transaction
  records, webhook idempotency, tests, and admin audit views.
- Geo matching can produce bad results. Mitigation: visible match reasons,
  manual admin diagnostics, and online fallback.
- Mobile auth can diverge from web auth. Mitigation: define token/session
  contract before deeper mobile investment.

## 10. Out of Scope for v1

- Native video calls.
- Group classes.
- Public tutor discovery without a student inquiry.
- Multi-language launch.
- Complex dispute workflows.
- Full LMS integrations.
- Tutor tax reporting.

## 11. Documentation Ownership

- App operations: `apps/edumatch/README.md`
- Mobile operations: `apps/mobile/README.md`
- Product and milestone plan: this file
- API details: `apps/edumatch/app/docs/page.tsx` and route handlers
- Database truth: `packages/db/prisma/schema.prisma`

Update this plan whenever a phase changes status or a major product decision
changes the shape of the roadmap.

## 12. Progress Notes

### 2026-05-07 â€” Prisma 7 rollback during mobile/start-script work

What actually happened:

- A Prisma update prompt led to an attempted `prisma@latest` update in
  `packages/db`.
- Prisma 7 rejected the existing datasource `url = env("DATABASE_URL")`
  schema style, causing `P1012` during `prisma generate`.
- `@prisma/client` exports then appeared broken to `@asafarim/db` and
  `@asafarim/auth` builds.
- `packages/db` was restored to pinned `prisma` and `@prisma/client`
  `6.19.3`.
- `@auth/prisma-adapter` was pinned to `2.8.0` to avoid drifting toward a
  Prisma 7 peer path.
- `pnpm install`, `@asafarim/auth` build, and `@asafarim/db` build succeeded
  again.

What surprised me:

- The original `packages/db` `prisma` range used `^6.6.0`, which allowed too
  much drift for a schema/tooling package with major-version breaking changes.
- `start.ps1` continued after package build failures, making the dev startup
  look healthier than it was.

What I would do differently next time:

- Pin Prisma CLI and client versions together for `packages/db`.
- Treat Prisma major upgrades as explicit migration tasks, not routine install
  prompt follow-ups.
- Keep startup scripts fail-fast when shared package builds fail.

### 2026-05-08 - Vionto production infra follow-through

Although this plan tracks EduMatch, the same monorepo production infrastructure patterns were extended to Vionto for Issue 030. Implemented Redis-backed Compose wiring, Vionto web and worker health/readiness checks, `DO_SPACES_*` storage env documentation, Nginx upload limits aligned to Vionto quotas, and deploy workflow changes to build/start/verify the worker. What surprised me: several Issue 030 items already existed partially, but the naming mismatch between old `S3_*` envs and the storage layer's `DO_SPACES_*` contract would have made production storage readiness misleading. Next time, I would verify env names against runtime code before treating infra checklists as complete.

### 2026-05-08 - Vionto Issue 033 vertical slice: project flow, upload sessions, asset persistence

Implemented the first functional project and asset flow for Vionto, replacing the demo-only upload surface with real project creation, presigned upload sessions, server-side EXIF/metadata extraction, and ViontoAsset persistence. Key changes:

- **Backend**: Added `getPublicUrlForKey` and `getObjectBytes` helpers to storage.ts for server-side metadata extraction. Fixed `/api/uploads/complete` to extract EXIF/dimensions from stored bytes (trusted source) instead of trusting client metadata, and fixed publicUrl to use storage key instead of filename.
- **New endpoint**: Created `POST /api/projects/[projectId]/assets` to promote upload session assets into persisted ViontoAsset rows, with optional ordering and session cleanup. Added `GET /api/projects/[projectId]/assets` to list project assets for refresh persistence.
- **Schemas**: Added `promoteSessionSchema` and `assetResponseSchema` to both app validation and shared `@asafarim/vionto-schemas` package.
- **UI rewrite**: Completely rewrote ViontoPage.tsx with project picker (select existing or create new), real upload flow (session → presign → PUT → complete → promote), progress tracking with retry/remove, and persisted asset thumbnails display. Removed all "demo-project" hardcoding.
- **Tests**: Added schema validation tests for promoteSessionSchema covering minimal payload, orderedKeys, clearSession flag, and max batch size.

What surprised me: The upload session infrastructure was already well-designed (in-memory for dev, Redis-ready for prod), but the complete endpoint was trusting client-provided metadata blindly. Server-side EXIF extraction adds a small latency but prevents tampering and ensures consistent metadata across the pipeline.

What I would do differently next time: Consider adding thumbnail generation to the worker queue immediately instead of falling back to original URLs. The current implementation uses original URLs as thumbnails, which works but may load full-resolution images in the UI.

### 2026-05-24 - VPS Docker disk recovery and health-check hardening

What actually happened:

- `pnpm rs` failed on the VPS with Docker overlay `no space left on device`.
- Docker cleanup reclaimed enough space to move `/dev/sda1` from full to a stable state, and a 6-hour age-filtered prune confirmed that most remaining cache was newer than 6 hours.
- The app images were rebuilt/recreated in a lower-pressure sequence, avoiding the previous Docker hang.
- All web services restarted, but Docker marked them unhealthy because container health checks used `localhost`; inside the runtime containers `127.0.0.1` worked while `localhost` returned connection refused.
- Compose health checks were changed to `127.0.0.1`, then services were recreated without rebuilding and all app containers became healthy.

What surprised me:

- The VPS provider panel still showed very high disk usage while `df -h /` reported the Linux filesystem at roughly 55% used after cleanup.
- Recent BuildKit cache can be large enough to risk another hang, but it is not removed by an `until=6h` prune.

What I would do differently next time:

- Build large Next.js app images sequentially on the small VPS instead of recreating all apps in one parallel Compose operation after a full cache prune.
- Keep Docker health checks pinned to `127.0.0.1` in containers that bind to `0.0.0.0`.
- Run the existing post-deploy prune routinely, and use a more aggressive BuildKit cache prune only when disk pressure is visible.

### 2026-05-25 - Prisma 7 migration branch for the shared database package

What actually happened:

- Created GitHub issue #113 to track the Prisma 7 major-version migration instead of treating it as a routine dependency bump.
- Upgraded `@asafarim/db` from Prisma 6.19.3 to 7.8.0 and added the required Postgres driver adapter.
- Moved the datasource URL out of `schema.prisma` into `prisma.config.ts`, keeping a local fallback so Prisma generation and validation can run without a live database URL.
- Wired `@prisma/adapter-pg` into the shared Prisma client constructor so Next.js builds no longer fail with the Prisma 7 client-engine adapter error.
- Verified `pnpm install --frozen-lockfile`, Prisma schema validation, Prisma client generation, `@asafarim/db` typecheck, `@asafarim/auth` build, full repo typecheck, and lint.

What surprised me:

- The first update partially installed Prisma Client 7 while the Prisma CLI was still 6.19.3, which caused generation to fail until both packages were aligned.
- Stale `.next/dev/types` files in EduMatch and Ops Hub caused unrelated TypeScript/build failures and had to be cleared before validation was meaningful.
- Local full app builds reached page generation but then hit Redis connection noise and Next/Turbo finalization hangs, so app build validation was treated separately from the Prisma migration checks.

What I would do differently next time:

- Upgrade Prisma CLI, Prisma Client, and the required driver adapter in one dedicated branch from the start.
- Clear generated Next.js caches before validating major dependency upgrades.
- Run app builds with local service dependencies such as Redis available when validating changes that touch shared server-side packages.
