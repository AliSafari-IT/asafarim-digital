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

### 1. Database Migrations
- [ ] Run `pnpm db:migrate` to create Cart/CartItem tables
- [ ] Run `pnpm db:seed` to seed EduMatch roles (`edumatch_student`, `edumatch_tutor`, `edumatch_admin`)
- [ ] Verify all EduMatch models are created:
  - `EduStudentProfile`
  - `EduTutorProfile`
  - `EduInquiry`, `EduAiResponse`, `EduQuoteRequest`
  - `EduQuote`, `EduBooking`, `EduTransaction`
  - `EduWallet`, `EduNotification`, `EduMessage`

### 2. Fix Role Checks in EduMatch Homepage
**File:** `apps/edumatch/app/page.tsx`

Current role checks use incorrect string values:
```typescript
const isStudent = session?.user?.roles?.includes("STUDENT");  // ❌ Wrong
const isTutor = session?.user?.roles?.includes("TUTOR");      // ❌ Wrong
```

Should use actual seeded role names:
```typescript
const isStudent = session?.user?.roles?.includes("edumatch_student");  // ✅ Correct
const isTutor = session?.user?.roles?.includes("edumatch_tutor");        // ✅ Correct
```

### 3. Create Profile APIs
- [ ] Student profile creation API (`/api/student/profile`)
  - POST: Create profile after first login
  - GET: Retrieve own profile
  - PATCH: Update profile (grade, subjects, learning goals)
- [ ] Tutor profile creation API (`/api/tutor/profile`)
  - POST: Create profile with verification docs
  - GET: Retrieve own profile
  - PATCH: Update bio, subjects, hourly rate, availability

### 4. Test Role-Based Button Display
Verify homepage buttons render correctly based on roles:
- No roles → "Get Started as Student" / "Become a Tutor"
- `edumatch_student` → "Ask a Question" button
- `edumatch_tutor` → "Go to Dashboard" button

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
