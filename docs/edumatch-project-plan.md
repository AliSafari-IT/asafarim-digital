# EduMatch — Project Plan

**Author:** Ali Safari
**Created:** 2026-04-27
**Status:** Planning
**Purpose:** Personal practice project to build the same skill set required by an upcoming professional engagement, in an unrelated domain.

---

## 1. Vision

EduMatch is a mobile + web app that helps students get unstuck on schoolwork through two pathways:

1. **AI-first (free / freemium):** Snap a photo of a homework problem or record a voice question. The app returns a step-by-step explanation, a short study plan, and recommended practice problems.
2. **Tutor marketplace (paid):** If the student wants human help, the app routes a standardized request to up to five matched tutors (by subject, level, location, online/in-person preference). Tutors return comparable quotes; the student books one and pays through the platform.

Revenue model: 15% commission on tutor bookings, optional premium AI tier (€4.99/month for unlimited explanations + saved study plans).

Geographic scope for MVP: one city or region (pick something small — e.g. a single university town).

---

## 2. Why this project

I'm building EduMatch as a deliberate skill-development exercise. The architecture is intentionally similar in *shape* to backend/marketplace systems I expect to work on professionally — multi-role auth, multimodal AI intake, geo-based matching, Stripe Connect payouts, PDF generation, mobile + web — but the domain (education) is different enough to be unmistakably my own work.

**Skills I'll come out of this with:**

- Full-stack Node.js + Postgres + Supabase
- Stripe Connect (split payments, webhooks, payouts, wallets)
- Multimodal AI integration (OpenAI vision + Whisper)
- Geo queries with PostGIS or Google Maps APIs
- Object storage (DigitalOcean Spaces or S3)
- PDF generation (Puppeteer)
- Flutter / FlutterFlow basics
- CI/CD with GitHub Actions
- Observability (Sentry + PostHog)

---

## 3. Tech stack

| Layer | Choice | Rationale |
|---|---|---|
| Mobile + web frontend | Flutter (with FlutterFlow for layouts) | Cross-platform, single codebase, the skill I most want to grow |
| Backend API | Node.js + TypeScript + Fastify (or Express) | Familiar territory, fast iteration |
| Database | Supabase (Postgres + Auth + Realtime) | Auth, RLS, and Postgres in one |
| Auth | Supabase Auth + JWT | Built-in, supports OAuth + email |
| Object storage | DigitalOcean Spaces (S3-compatible) | Cheap, region close to EU |
| Payments | Stripe Connect (Express accounts) | Industry standard for marketplace payouts |
| AI providers | OpenAI (GPT-4o + Whisper for voice) primary, Claude as failover | Multimodal in one API |
| Geo | PostGIS extension + Google Maps Distance Matrix | Spatial queries + travel-time estimates |
| Email | Resend or Mailgun | Simple API, decent free tier |
| Observability | Sentry (errors) + PostHog (product analytics) | Free tier for solo dev |
| CI/CD | GitHub Actions | Standard |
| Hosting (backend) | Fly.io or Railway | Cheap, easy Postgres add-ons |
| Hosting (frontend web) | Vercel or Cloudflare Pages | Free tier, fast |

---

## 4. High-level architecture

```
[Flutter app (iOS / Android / Web)]
            │
            ▼
[Node.js API — REST + a few GraphQL endpoints]
            │
   ┌────────┼─────────┬──────────────┬──────────────┐
   ▼        ▼         ▼              ▼              ▼
[Supabase  [DO Spaces  [OpenAI /     [Stripe       [Google Maps
 Postgres]  object      Anthropic]    Connect]      APIs]
            storage]
   │
   ▼
[Background workers — Bull queue]
   ├─ AI processing jobs
   ├─ Email notifications
   ├─ Stripe webhook handling
   └─ PDF generation
```

---

## 5. Data model

Initial schema. Field types abbreviated; full DDL will live in `db/migrations/`.

### `users`
- `id` (uuid, pk)
- `email` (unique)
- `role` (enum: STUDENT, TUTOR, ADMIN)
- `display_name`
- `created_at`, `updated_at`

### `student_profiles`
- `user_id` (fk → users)
- `grade_level` (enum: K12, UNDERGRAD, GRAD)
- `subjects_of_interest` (text[])
- `home_address` (jsonb), `home_location` (geography point)

### `tutor_profiles`
- `user_id` (fk → users)
- `bio`, `subjects_taught` (text[]), `levels_taught` (text[])
- `hourly_rate_cents`
- `online_only` (bool), `service_radius_km` (int)
- `home_location` (geography point)
- `stripe_account_id`, `payout_enabled` (bool)
- `verified_at` (nullable timestamp — admin verification)
- `rating_avg`, `rating_count`

### `inquiries` *(equivalent to "leads")*
- `id` (uuid, pk)
- `student_id` (fk → users)
- `subject`, `grade_level`, `description` (text)
- `attachments` (jsonb — array of `{type, url, mime}`)
- `ai_summary` (text — what the AI extracted)
- `status` (enum: NEW, AI_RESPONDED, TUTOR_REQUESTED, BOOKED, CLOSED)
- `created_at`

### `ai_responses`
- `id`, `inquiry_id` (fk)
- `model_used`, `prompt_version`
- `explanation` (markdown), `study_plan` (jsonb), `practice_problems` (jsonb)
- `token_cost`, `latency_ms`
- `created_at`

### `quote_requests`
- `id`, `inquiry_id` (fk), `student_id`
- `requested_at`, `expires_at`

### `quotes`
- `id`, `quote_request_id` (fk), `tutor_id`
- `hourly_rate_cents`, `estimated_hours`, `total_cents`
- `availability_slots` (jsonb)
- `notes` (text)
- `pdf_url`
- `status` (enum: PENDING, SENT, ACCEPTED, DECLINED, EXPIRED)

### `bookings`
- `id`, `quote_id` (fk), `student_id`, `tutor_id`
- `scheduled_at`, `duration_minutes`, `mode` (ONLINE / IN_PERSON)
- `meeting_url` (nullable)
- `stripe_payment_intent_id`
- `status` (enum: SCHEDULED, COMPLETED, CANCELLED, DISPUTED)

### `transactions`
- `id`, `booking_id` (fk), `tutor_id`
- `gross_cents`, `platform_fee_cents`, `net_cents`
- `stripe_charge_id`, `type` (CHARGE / REFUND / PAYOUT)
- `created_at`

### `wallets`
- `tutor_id` (pk, fk → users)
- `balance_cents`, `pending_cents`
- `payout_threshold_cents`, `last_payout_at`

### `notifications`
- `id`, `user_id` (fk), `type`, `payload` (jsonb)
- `read_at` (nullable), `sent_at`

### `messages` *(in-app chat between student and booked tutor)*
- `id`, `booking_id` (fk), `sender_id`, `body`, `created_at`

Seed data: ~20 subjects (Mathematics, Physics, English Lit, etc.), ~5 grade levels, 10 fake tutor accounts in one test region.

---

## 6. Phased implementation plan

The plan is sized to ~14 weeks of evening / weekend work. Adjust ruthlessly as I learn.

### Phase 0 — Setup (Week 1)

- Initialize monorepo: `apps/api`, `apps/mobile`, `db/`, `docs/`.
- Provision Supabase project, DigitalOcean Spaces bucket, Stripe test account.
- Set up GitHub repo, GitHub Actions skeleton (lint + test on PR).
- Wire Sentry + PostHog with placeholder events.
- **Deliverable:** "Hello world" API responding on Fly.io, "Hello world" Flutter app running on iOS simulator + web.

### Phase 1 — Foundations (Weeks 2–4)

**1.1 Database schema + migrations**

- Author all tables from §5 as SQL migrations.
- Seed script for subjects, grade levels, test users.
- Document RLS policies in `db/POLICIES.md`.
- **Effort:** 4 days. **Skill payoff:** Postgres schema design, migrations, RLS.

**1.2 Auth + role-based access**

- Supabase Auth wired in API + Flutter.
- JWT middleware, role enforcement decorator.
- Email verification + password reset flows.
- 2FA via TOTP for tutors (since they receive payouts).
- **Effort:** 6 days. **Skill payoff:** Auth flows, JWTs, 2FA edge cases.

**1.3 User profile APIs**

- CRUD for student + tutor profiles.
- Address geocoding via Google Maps API on save.
- **Effort:** 4 days. **Skill payoff:** REST design, validation (zod), OpenAPI docs.

### Phase 2 — Intake + AI (Weeks 5–7)

**2.1 Intake API + file uploads**

- POST `/inquiries` with multipart upload to DO Spaces via presigned URLs.
- Validate file types (jpeg, png, mp4 ≤ 50 MB, m4a / wav for voice).
- Persist `inquiries` row, push job onto queue.
- **Effort:** 5 days. **Skill payoff:** Multipart uploads, presigned URLs, queue handoff.

**2.2 AI orchestrator**

- Worker consumes intake jobs.
- Routes to OpenAI: vision for image, Whisper for audio, GPT-4o for text + reasoning.
- Composes a structured response: `{explanation, study_plan, practice_problems}`.
- Stores prompt version, token cost, latency in `ai_responses`.
- Failover to Claude on OpenAI 5xx.
- **Effort:** 8 days. **Skill payoff:** Multimodal AI, prompt versioning, observability around model calls.

**2.3 Realtime AI response delivery to client**

- Server-sent events (or Supabase Realtime) push the AI response back to the Flutter client as it streams.
- **Effort:** 3 days. **Skill payoff:** Streaming UX, realtime patterns.

### Phase 3 — Marketplace + matching (Weeks 8–9)

**3.1 Tutor matching**

- Given an inquiry's subject + grade level + student location, return up to 5 ranked tutors.
- Ranking signals: distance (PostGIS), rating, price tier, online_only fit.
- API endpoint + admin debug view.
- **Effort:** 5 days. **Skill payoff:** Spatial queries, ranking design.

**3.2 Quote request + standardized quotes**

- POST `/quote-requests` creates a `quote_requests` row + 5 `quotes` (status PENDING).
- Notification fires to each matched tutor.
- Tutor app shows pending requests; tutor fills in `hourly_rate`, `estimated_hours`, `availability_slots`, optional `notes`. System pre-fills hourly rate from their profile.
- **Effort:** 5 days. **Skill payoff:** Multi-actor workflows, request/response state machines.

### Phase 4 — Payments + payouts (Weeks 10–11)

**4.1 Stripe Connect onboarding**

- During tutor signup, open Stripe Connect Express onboarding flow.
- Store `stripe_account_id`, set `payout_enabled` based on Stripe webhook.
- **Effort:** 3 days. **Skill payoff:** Connect onboarding, webhooks.

**4.2 Booking + checkout**

- Student selects a quote → API creates a Stripe `PaymentIntent` with application fee (15%) and `transfer_data.destination` = tutor's Stripe account.
- On `payment_intent.succeeded` webhook, mark booking SCHEDULED, credit tutor wallet (pending until session completes).
- **Effort:** 6 days. **Skill payoff:** Stripe Connect split payments, webhook idempotency.

**4.3 Wallet + payouts**

- Daily scheduled job: any tutor with `pending_cents` > 0 and a session that completed >24h ago → move to `balance_cents`.
- When `balance_cents` ≥ `payout_threshold_cents` and last payout ≥ 7 days ago → trigger Stripe payout.
- Wallet view in tutor app: balance, pending, transaction history.
- **Effort:** 5 days. **Skill payoff:** Cron jobs, financial bookkeeping invariants.

### Phase 5 — PDFs + notifications (Week 12)

**5.1 Quote PDF generation**

- Worker renders a quote as HTML template (Handlebars), Puppeteer converts to PDF, uploads to DO Spaces, signs URL, stores on `quotes.pdf_url`.
- **Effort:** 4 days. **Skill payoff:** Headless browser PDFs, signed URLs.

**5.2 Email notifications**

- Templated emails: inquiry received, AI response ready, quote received, booking confirmed, payout sent.
- Resend/Mailgun integration with retry queue.
- **Effort:** 3 days. **Skill payoff:** Transactional email patterns.

### Phase 6 — Flutter UI (Weeks 13–14)

Minimum shippable surface:

- **Onboarding** (role select, sign-up, profile build)
- **Student home** (list of past inquiries, "ask new question" CTA)
- **Intake screen** (text + image + voice capture)
- **AI response screen** (streamed explanation, "Get tutor quotes" button)
- **Quote comparison screen** (5 quotes side-by-side)
- **Booking + checkout screen** (Stripe payment sheet)
- **Tutor home** (incoming requests, wallet, settings)

**Effort:** 10 days. **Skill payoff:** Flutter fundamentals, state management (Riverpod), Stripe payment sheet integration.

### Phase 7 — Polish + ship (Week 15+, ongoing)

- E2E tests with Playwright (web) + integration tests for API.
- Real device testing on iOS + Android.
- Privacy policy + terms (template, since this is a practice project).
- Deploy to TestFlight + Play Console internal track.
- Invite 5 friends to try it.

---

## 7. Skill mapping

| EduMatch module | Skill it builds |
|---|---|
| Auth + RBAC | Multi-role auth, 2FA, JWT middleware |
| Schema + migrations | Postgres design, RLS, migration tooling |
| Intake API + uploads | Multipart, presigned URLs, queue handoff |
| AI orchestrator | Multimodal AI, prompt versioning, model failover |
| Tutor matching | Spatial queries, ranking, geo APIs |
| Quote workflow | Multi-actor state machines, notifications |
| Stripe Connect | Connect onboarding, split payments, webhooks |
| Wallet + payouts | Financial invariants, scheduled jobs |
| PDF generation | Headless browser, templating |
| Realtime AI delivery | Server-sent events, streaming UX |
| Flutter UI | Cross-platform UI, state management, payment sheet |

---

## 8. Risks I'm acknowledging up front

- **AI cost overrun.** Token bills can balloon fast. Set hard per-user daily caps in code from day one. Use cheaper models (gpt-4o-mini, Whisper) where quality is sufficient.
- **Stripe Connect onboarding requires real KYC.** Fine for test mode, but if I want to demo to anyone live I'll need a real bank account and will face Stripe's verification process.
- **Flutter learning curve.** First time shipping Flutter. Realistic expectation: the Phase 6 estimate may double. That's fine — it's the point.
- **Scope creep.** Easy to add chat, ratings, dispute resolution, group sessions. I will resist; ship the loop first, polish second.
- **Domain accuracy.** Math/science explanations from LLMs are sometimes confidently wrong. Add a "this might be wrong, double-check" disclaimer in the UI from day one.

---

## 9. Out of scope for v1

- In-app video calls (use Zoom/Meet links from tutor profile)
- Group classes
- Tutor-to-tutor or student-to-student social features
- Multi-language (English only at launch)
- iOS / Android push notifications (email only at launch)
- Admin web dashboard (use Supabase Studio + SQL)

---

## 10. Repo layout

```
edumatch/
├── apps/
│   ├── api/             # Node.js + TypeScript backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── workers/
│   │   │   ├── lib/
│   │   │   └── server.ts
│   │   └── tests/
│   └── mobile/          # Flutter app
│       ├── lib/
│       │   ├── screens/
│       │   ├── widgets/
│       │   ├── services/
│       │   └── main.dart
│       └── test/
├── db/
│   ├── migrations/
│   ├── seeds/
│   └── POLICIES.md
├── docs/
│   ├── project-plan.md  # this file
│   ├── adr/             # architecture decision records
│   └── api/             # OpenAPI spec
├── .github/workflows/
└── README.md
```

---

## 11. First-week concrete checklist

- [ ] Create GitHub repo `edumatch`, push monorepo skeleton
- [ ] Provision Supabase project, save connection string in `.env.local`
- [ ] Provision DO Spaces bucket + access keys
- [ ] Create Stripe test account, get test API keys
- [ ] Get OpenAI API key + set spending cap to €20/month
- [ ] `apps/api`: Fastify boots, `/health` returns `{ok: true}`, deployed to Fly.io
- [ ] `apps/mobile`: Flutter app boots on iOS simulator + Chrome
- [ ] GitHub Actions: lint + test runs green on push
- [ ] First migration: `users` table, RLS policies
- [ ] First commit message in conventional commits format

---

## 12. Learning resources I'm pre-loading

- **Stripe Connect** — official Connect docs, end-to-end. Especially the "destination charges with application fees" pattern.
- **Flutter** — flutter.dev official tutorial, Riverpod docs, then build a throwaway todo app before touching EduMatch UI.
- **PostGIS** — `postgis.net` intro + a quick tutorial on `ST_DWithin` and `geography` vs. `geometry`.
- **OpenAI multimodal** — official cookbook for vision and Whisper; pay attention to streaming.
- **Supabase RLS** — Supabase docs on row-level security patterns; this is where most beginners trip.

---

*This plan is a living document. Update it after each phase with what actually happened, what surprised me, and what I'd do differently next time.*
