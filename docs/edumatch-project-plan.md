# EduMatch Project Plan

**Author:** Ali Safari
**Created:** 2026-04-27
**Updated:** 2026-05-04
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

### Phase 11 - Production Launch and Scale

Goal: launch EduMatch to real users with production infrastructure.

Deliverables:

- Production deployment with SSL, CDN, and auto-scaling.
- Production Stripe Connect live mode configuration.
- Production Firebase Cloud Messaging setup for push notifications.
- Application Store (App Store/Play Store) public submissions with screenshots, privacy policy, and review responses.
- Rate limiting and abuse detection on API endpoints.
- Production monitoring: error tracking (Sentry), uptime monitoring, performance metrics.
- Backup and disaster recovery procedures for database and storage.
- Customer support ticketing integration and escalation paths.
- Compliance documentation: GDPR, COPPA (if minors), and payment regulations.
- Launch marketing materials: landing page, demo video, and tutor recruitment kit.

Acceptance criteria:

- App passes App Store and Play Store review.
- Production Stripe payments flow correctly with real money.
- 99.9% uptime during launch week with automated rollback capability.
- Support team can handle payment disputes and account issues within SLA.
- All critical errors are alerted within 5 minutes.

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
