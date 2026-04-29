# EduMatch

AI-first homework help + tutor marketplace. Web and API live here as a single
Next.js 16 app inside the `asafarim-digital` monorepo. The Flutter mobile app
is intentionally out of scope and will live in a separate repo if/when needed.

See the full plan at [`docs/edumatch-project-plan.md`](../../docs/edumatch-project-plan.md).

## Status

**Phase 2.1 — Intake API + presigned uploads.** Skeleton boots, `/api/health`
is public, all other routes require an authenticated session.

Endpoints in scope for this phase:

- `POST /api/uploads/presign` — STUDENT-only. Validates filename, MIME, and
  size against `lib/server/validation.ts`, mints a key namespaced by user id,
  and returns a presigned PUT URL (or a `local-stub://` URL when
  `SPACES_*` env vars are absent — keeps dev offline-friendly).
- `POST /api/inquiries` — STUDENT-only. Validates intake JSON, refuses
  attachment keys not minted for the caller, verifies each object exists in
  storage (skipped in stub mode), persists `EduInquiry` with status `NEW`.
  TODO at Phase 2.2: enqueue AI orchestrator job.
- `GET /api/inquiries` — STUDENT-only. Returns the caller's own inquiries.

Limits: 5 attachments × 50 MB each. Allowed MIME types: `image/{jpeg,png,webp,heic}`,
`video/{mp4,quicktime}`, `audio/{mp4,mpeg,wav,webm}`, `text/plain`,
`application/pdf`.

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
