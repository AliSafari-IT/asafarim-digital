# EduMatch Trust, Safety, and Quality Hardening

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `trust-safety`, `ai`, `quality`

## Objective

Harden EduMatch's existing student/tutor marketplace loop with source-verified
trust, safety, audit, and quality improvements.

This is not a greenfield milestone. The source already includes the core
marketplace flow, tutor verification primitives, booking cancellation/dispute
fields, wallet payout rules, notifications, and E2E tests. This issue focuses on
the remaining gaps needed before broader QA or pilot use.

## Source Review Notes

Confirmed existing implementation:

- `EduTutorProfile.verifiedAt` exists in `packages/db/prisma/schema.prisma`.
- Tutor matching already scores verified tutors in
  `apps/edumatch/lib/server/tutor-matching.ts`.
- Quote comparison already displays verified tutor state in
  `apps/edumatch/app/student/inquiry/[id]/quotes/page.tsx`.
- `EduBooking` already supports `CANCELLED`, `DISPUTED`, `cancelledAt`, and
  `cancellationReason`.
- `EduTransaction.type` already supports `CHARGE`, `REFUND`, `PAYOUT`, and
  `PLATFORM_FEE`.
- Wallet payout threshold and cooldown logic already exist in
  `apps/edumatch/lib/server/wallet.ts`.
- Stripe webhook handling exists at `apps/edumatch/app/api/webhooks/stripe/route.ts`.
- Notification and email services exist in `apps/edumatch/lib/server/notifications.ts`
  and `apps/edumatch/lib/server/email.ts`.
- Playwright E2E files already exist for checkout, student flow, and tutor flow.

Remaining gaps found from source review:

- No dedicated AI moderation or academic-integrity guardrail was found.
- No persisted moderation outcome/reason was found on inquiry or AI response.
- No visible AI answer disclaimer was found in the student inquiry UI.
- Tutor verification exists as a field, but there is no full admin verification
  workflow/checklist.
- Booking cancellation/dispute fields exist, but no complete student/tutor/admin
  workflow was found for requesting, reviewing, and resolving those states.
- Refund transaction type exists, but the refund workflow needs explicit service
  and UI design to avoid misleading users.
- Notifications exist, but user-level notification preferences were not found.
- Generic `AuditLog` exists in the shared schema, but no EduMatch-specific audit
  trail was found for inquiry, AI, quote, booking, payout, or verification
  state changes.

## Product Goal

Make the current EduMatch loop safer and clearer without duplicating completed
work:

- Students should see clear AI safety and accuracy language.
- Academic-integrity-breaking prompts should be redirected or refused.
- Tutor verification should become an admin-managed workflow, not just a field.
- Cancellation, dispute, and refund states should be actionable and honest.
- Notification delivery should respect user preferences.
- Critical EduMatch state changes should be auditable.
- Existing E2E coverage should be extended around the new safety flows.

## Suggested Scope

### 1. AI Safety and Academic Integrity

- [ ] Add visible AI answer disclaimer on inquiry AI response pages.
- [ ] Add a lightweight moderation layer before AI generation.
- [ ] Flag requests that look like direct cheating, exam bypass, plagiarism, or
      unsafe personal guidance.
- [ ] Add safe response patterns:
  - explain concepts
  - guide the student through steps
  - ask clarifying questions
  - refuse or redirect when the request is academically unsafe
- [ ] Persist moderation outcome, category, and reason on `EduInquiry`,
      `EduAiResponse`, or a related table.
- [ ] Add unit/API tests for allowed, borderline, and refused prompts.

### 2. Tutor Verification Workflow

- [ ] Keep using existing `EduTutorProfile.verifiedAt`.
- [ ] Add admin-managed verification workflow around that field:
  - pending
  - needs changes
  - verified
  - rejected
- [ ] Add optional verification checklist and admin notes.
- [ ] Add admin UI for reviewing tutor profiles.
- [ ] Decide whether unverified tutors can receive quote requests.
- [ ] If unverified tutors are excluded, update tutor matching and request inbox
      behavior with tests.

### 3. Cancellation, Dispute, and Refund Workflow

- [ ] Use existing `EduBooking.status`, `cancelledAt`, and
      `cancellationReason` fields.
- [ ] Define allowed booking transitions for:
  - student cancellation request
  - tutor cancellation request
  - admin dispute review
  - dispute resolved
  - refund recorded
- [ ] Add service functions and API routes for those transitions.
- [ ] Use existing `EduTransaction.type = REFUND` for refund records.
- [ ] Add UI copy that clearly distinguishes "refund requested", "refund
      approved", and "refund processed".
- [ ] Do not imply Stripe refund execution until the Stripe refund call exists.

### 4. Notification Preferences

- [ ] Add user-level notification preferences for EduMatch events.
- [ ] Cover:
  - inquiry received
  - AI response ready
  - quote received
  - booking confirmed
  - cancellation/dispute updates
  - payout sent
- [ ] Update email/notification dispatch to respect preferences where safe.
- [ ] Add tests for preference lookup and dispatch decisions.

### 5. EduMatch Audit Trail

- [ ] Reuse the shared `AuditLog` model or add a dedicated EduMatch audit model.
- [ ] Emit audit events for:
  - inquiry created
  - AI response generated/refused
  - quote request created
  - quote submitted
  - quote accepted/declined
  - booking confirmed/cancelled/disputed
  - checkout completed
  - payout requested/sent/failed
  - tutor verification changed
  - refund/dispute admin action
- [ ] Include actor id, role, target id, previous state, next state, and reason
      where available.
- [ ] Add an admin view or documented query path for reviewing EduMatch audit
      events.

### 6. Quality Coverage

- [ ] Extend existing unit/API tests for:
  - moderation outcomes
  - tutor verification workflow
  - cancellation/dispute state transitions
  - refund record creation
  - notification preference filtering
  - audit event creation
- [ ] Extend existing Playwright coverage for:
  - student sees AI disclaimer
  - unsafe prompt gets redirected/refused
  - admin verifies/rejects tutor
  - cancellation/dispute request path
  - wrong-role access remains blocked
- [ ] Update seeded demo data to support the trust/safety walkthrough.

## Acceptance Criteria

- [ ] AI responses show clear safety/accuracy language in student-facing UI.
- [ ] Unsafe or academically inappropriate prompts can be refused or redirected.
- [ ] Tutor verification is reviewable by admins and visible to students.
- [ ] Existing booking cancellation/dispute fields are backed by real workflow
      transitions.
- [ ] Refund records can be represented without implying unsupported Stripe
      behavior.
- [ ] Notification preferences exist and are respected by dispatch logic.
- [ ] Critical EduMatch state changes emit audit events.
- [ ] Tests cover the new safety and workflow behavior.
- [ ] The existing student/tutor happy path remains usable with seeded data.

## Non-Goals

- Full legal/compliance automation.
- Real production background checks.
- Fully automated refund decisions.
- Native video calls.
- Group classes.
- Public tutor search without an inquiry.

## Related Files and Areas

- `apps/edumatch/app/student/inquiry/[id]/page.tsx`
- `apps/edumatch/app/api/inquiries/[id]/ai/route.ts`
- `apps/edumatch/lib/server/ai-orchestrator.ts`
- `apps/edumatch/lib/server/tutor-matching.ts`
- `apps/edumatch/lib/server/quotes.ts`
- `apps/edumatch/lib/server/stripe.ts`
- `apps/edumatch/lib/server/wallet.ts`
- `apps/edumatch/lib/server/email.ts`
- `apps/edumatch/lib/server/notifications.ts`
- `apps/edumatch/app/admin/tutor-matching/page.tsx`
- `packages/db/prisma/schema.prisma`

## Notes

This issue intentionally builds on what already exists. Do not duplicate existing
verification fields, booking states, transaction types, wallet rules, or E2E
tests; extend them into complete trust and safety workflows.
