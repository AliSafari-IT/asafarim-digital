# Phase 4 — EduMatch Payments + Payouts

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `payments`, `stripe`, `payouts`

## Objective
Implement Phase 4 of the EduMatch project: Stripe Connect onboarding for tutors, student checkout with split payments, and tutor wallet with automated payouts.

## Background
Phase 3 (Marketplace + Matching + Notifications) is complete:
- ✅ Tutor matching algorithm with ranking
- ✅ Notification system (in-app + email)
- ✅ Admin debug view for matching
- ✅ Rate limiting implemented
- ✅ Email templates created

## Tasks

### 1. Stripe Connect Onboarding ⚠ to implement
**Files:**
- `apps/edumatch/app/tutor/connect/onboard/page.tsx` — onboarding redirect
- `apps/edumatch/app/api/tutors/connect/onboard/route.ts` — create Connect account
- `apps/edumatch/app/api/webhooks/stripe/route.ts` — handle `account.updated`

During tutor signup, initiate Stripe Connect Express onboarding:
- Create `Account` with `type=express`, `capabilities={transfers: true, card_payments: true}`
- Store `stripe_account_id` on `EduTutorProfile`
- Generate onboarding URL with `account_link` API
- On `account.updated` webhook: set `payout_enabled = charges_enabled && details_submitted`
- Redirect tutor to Stripe, then back to `/tutor/connect/success` or `/tutor/connect/refresh`

### 2. Booking + Checkout Flow ⚠ to implement
**Files:**
- `apps/edumatch/app/api/bookings/route.ts` — new booking creation
- `apps/edumatch/app/api/quotes/[id]/checkout/route.ts` — existing stub to complete
- `apps/edumatch/app/student/booking/[id]/page.tsx` — booking confirmation UI

Student accepts a quote → create booking + PaymentIntent:
- Create `EduBooking` with status `PENDING_PAYMENT`
- Create Stripe `PaymentIntent` with:
  - `amount` = quote total (hourlyRateCents × estimatedHours)
  - `application_fee_amount` = 15% platform fee
  - `transfer_data.destination` = tutor's Stripe account
  - `metadata` = {bookingId, quoteId, studentId, tutorId}
- Return `client_secret` to frontend
- Student confirms payment via Stripe Elements

On `payment_intent.succeeded` webhook:
- Update `EduBooking.status` → `SCHEDULED`
- Credit tutor wallet: `pending_cents` += (gross - platform_fee)
- Create `EduTransaction` row for audit trail
- Send notifications to student and tutor

### 3. Wallet + Payouts ⚠ to implement
**Files:**
- `apps/edumatch/lib/server/wallet.ts` — new file
- `apps/edumatch/app/api/tutors/wallet/route.ts` — existing, extend
- `apps/edumatch/lib/workers/payouts.ts` — new scheduled job

Wallet mechanics:
- `EduWallet` table: `balance_cents`, `pending_cents`, `payout_threshold_cents`, `last_payout_at`
- Daily scheduled job (cron or BullMQ):
  1. Move eligible pending → balance (sessions completed >24h ago)
  2. For each tutor where `balance_cents >= threshold` and `last_payout_at >= 7 days ago`:
     - Create Stripe `Payout` to their connected account
     - On success: debit `balance_cents`, update `last_payout_at`
     - Create `EduTransaction` (type: PAYOUT)
     - Send email notification

Tutor wallet view:
- Display `balance_cents` (available), `pending_cents` (on hold)
- Transaction history list
- Payout threshold setting (editable, default €25)
- Manual "Request Payout" button (if balance >= threshold)

### 4. Webhook Security & Idempotency ⚠ to implement
**File:** `apps/edumatch/app/api/webhooks/stripe/route.ts`

- Verify `Stripe-Signature` header using `stripe.webhooks.constructEvent()`
- Idempotency: check `EduTransaction.stripe_charge_id` before processing
- Return 200 immediately to Stripe, process async if needed
- Log all webhook events for debugging

## Acceptance Criteria
- [ ] Tutor can complete Stripe Connect onboarding
- [ ] Tutor profile shows `payout_enabled` after Stripe verification
- [ ] Student can pay for a booking with 15% platform fee
- [ ] On payment success, booking is SCHEDULED and tutor wallet credited
- [ ] Tutor wallet shows correct balance/pending split
- [ ] Automated payouts trigger when threshold + timing conditions met
- [ ] All webhooks are signature-verified and idempotent
- [ ] Failed webhooks are logged and can be retried

## Technical Notes
- **Stripe Connect:** Use Express accounts (fastest onboarding). Platform keeps 15%.
- **Webhook idempotency:** Store `stripe_event_id` or use `stripe_charge_id` uniqueness.
- **Currency:** Euro (EUR) for all transactions. Use `amount` in cents (integer).
- **Payout timing:** 24-hour hold on pending → balance, then weekly auto-payout.
- **Error handling:** If Stripe payout fails, retry on next cron run. Alert admin after 3 failures.

## Environment Variables Required
| Variable | Used by |
|---|---|
| `STRIPE_SECRET_KEY` | All Stripe operations |
| `STRIPE_PUBLISHABLE_KEY` | Frontend checkout |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_CONNECT_CLIENT_ID` | OAuth onboarding (optional, if using OAuth flow) |
| `PLATFORM_FEE_PERCENT` | 15 (default) — can be adjusted |
| `PAYOUT_THRESHOLD_CENTS` | 2500 (€25.00) — minimum auto-payout |
| `PAYOUT_HOLD_DAYS` | 1 — days before pending → balance |
| `PAYOUT_INTERVAL_DAYS` | 7 — minimum days between payouts |

## Related Files
- `apps/edumatch/app/api/quotes/[id]/checkout/route.ts` — checkout stub
- `apps/edumatch/app/api/tutors/wallet/route.ts` — wallet API
- `apps/edumatch/app/tutor/page.tsx` — dashboard with wallet display
- `packages/db/prisma/schema.prisma` — `EduWallet`, `EduTransaction`, `EduBooking`
- `apps/edumatch/lib/server/stripe.ts` — shared Stripe client (exists)

## Estimated Effort
2 weeks (10–12 days)

## Blockers
- Stripe Connect test account must be set up with Express enabled
- Tutor matching (Phase 3) must be working to generate quote bookings
- Webhook endpoint must be publicly accessible (ngrok for dev, HTTPS for prod)
