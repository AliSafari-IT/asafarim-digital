# Phase 1 — EduMatch Foundations

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `database`, `auth`

## Objective
Implement Phase 1 of the EduMatch project: core foundations including database migrations, role-based routing fixes, and essential profile APIs.

## Background
Phase 0.5 (Shared Infrastructure) is complete:
- ✅ `@asafarim/payments` package with Stripe Connect
- ✅ Unified cart/basket service
- ✅ Role-based app switcher
- ✅ EduMatch roles & permissions seeded

## Tasks

### 1. Database Migrations ⚠ user action
Run locally (requires a running Postgres and `.env` DATABASE_URL):
```bash
pnpm --filter @asafarim/db db:migrate
pnpm --filter @asafarim/db db:seed
```
- [ ] Migration creates Cart/CartItem tables + all EduMatch tables
- [ ] Seed registers `edumatch_student`, `edumatch_tutor`, `edumatch_admin` roles and the 25 EduMatch permissions
- [ ] Verify all EduMatch models are created:
  - `EduStudentProfile`
  - `EduTutorProfile`
  - `EduInquiry`, `EduAiResponse`, `EduQuoteRequest`
  - `EduQuote`, `EduBooking`, `EduTransaction`
  - `EduWallet`, `EduNotification`, `EduMessage`

### 2. Fix Role Checks in EduMatch Homepage ✅ done
**File:** `apps/edumatch/app/page.tsx`

```typescript
const isStudent = session?.user?.roles?.includes("edumatch_student");
const isTutor = session?.user?.roles?.includes("edumatch_tutor");
```

### 3. Create Profile APIs ✅ done
- [x] Student profile API — `apps/edumatch/app/api/student/profile/route.ts`
  - `GET` — returns 404 when no profile exists
  - `POST` — upsert + auto-attach `edumatch_student` role
  - `PATCH` — partial update (grade, subjects, home address)
- [x] Tutor profile API — `apps/edumatch/app/api/tutor/profile/route.ts`
  - `GET` — returns 404 when no profile exists
  - `POST` — upsert + auto-attach `edumatch_tutor` role
  - `PATCH` — partial update (bio, subjects, levels, rate, radius, address)
- [x] Zod schemas in `apps/edumatch/lib/server/validation.ts`
  - `studentProfileSchema` / `studentProfilePatchSchema`
  - `tutorProfileSchema` / `tutorProfilePatchSchema`
- [x] Server helpers in `apps/edumatch/lib/server/profiles.ts`
  - `upsertStudentProfile`, `updateStudentProfile`
  - `upsertTutorProfile`, `updateTutorProfile`
  - `assignRoleIfMissing` — idempotent RBAC role attach

### 4. Test Role-Based Button Display ⚠ user action
After running migrations + seed, sign in and verify:
- No roles → "Get Started as Student" / "Become a Tutor"
- `edumatch_student` → "Ask a Question" button
- `edumatch_tutor` → "Go to Dashboard" button

To trigger a role, POST to the profile API while signed in:
```bash
curl -X POST http://localhost:3005/api/student/profile \
  -H "Content-Type: application/json" \
  -d '{"gradeLevel":"K12","subjectsOfInterest":["Math"]}'
```
Then sign out/in to refresh the session roles.

## Acceptance Criteria
- [ ] Database migrations run successfully without errors
- [ ] Cart and CartItem tables exist with proper foreign keys
- [ ] EduMatch roles are queryable in the database
- [ ] Homepage displays correct CTA buttons based on user role
- [ ] Student/tutor can create and view their profiles
- [ ] All new APIs return proper TypeScript types

## Technical Notes
- Use `@asafarim/db` for all database operations
- Reuse existing auth session from portal (already configured)
- Follow existing API pattern in `apps/portal/app/api/`
- Profile creation should auto-assign role if missing

## Related Files
- `apps/edumatch/app/page.tsx` - Homepage with role checks
- `apps/edumatch/.env` - Environment variables (already has `NEXT_PUBLIC_EDUMATCH_URL`)
- `packages/db/prisma/schema.prisma` - Database schema
- `packages/db/prisma/seed.ts` - Role definitions

## Estimated Effort
2-3 days

## Blockers
None - Phase 0.5 infrastructure is complete and ready.
