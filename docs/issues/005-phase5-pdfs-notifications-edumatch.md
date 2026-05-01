# Phase 5 — EduMatch PDFs + Email Notifications

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `pdf`, `email`, `notifications`

## Objective
Implement Phase 5 of the EduMatch project: PDF quote generation using Puppeteer and comprehensive email notification system via Resend.

## Background
Phase 4 (Payments + Payouts) is complete:
- ✅ Stripe Connect onboarding for tutors
- ✅ Student checkout with PaymentIntent
- ✅ Tutor wallet with balance/pending tracking
- ✅ Automated payout scheduling
- ✅ Webhook handlers for payment events

## Tasks

### 1. Quote PDF Generation ⚠ to implement
**Files:**
- `apps/edumatch/lib/server/pdf.ts` — PDF generation service
- `apps/edumatch/lib/emails/quote-pdf.html` — Handlebars template
- `apps/edumatch/lib/workers/pdf-generation.ts` — BullMQ worker
- `apps/edumatch/app/api/quotes/[id]/pdf/route.ts` — download endpoint (stub exists)

Render quotes as professional PDFs:
- HTML template with Handlebars (logo, quote details, tutor info, pricing breakdown)
- Puppeteer converts HTML to PDF
- Upload to DigitalOcean Spaces
- Generate signed URL (1 hour expiry)
- Store `pdfUrl` on `EduQuote` row
- Trigger via BullMQ job when quote is submitted

```typescript
// Expected PDF content
- EduMatch logo + header
- Quote ID, date, expiry
- Student: name, subject, grade level
- Tutor: name, bio, rating
- Session details: rate, hours, total
- Platform fee breakdown (15%)
- Terms & conditions footer
```

### 2. Email Notification System ⚠ to implement
**Files:**
- `apps/edumatch/lib/server/email.ts` — Resend integration
- `apps/edumatch/lib/emails/` — HTML templates directory
- `apps/edumatch/lib/workers/email.ts` — email queue worker
- `apps/edumatch/app/api/notifications/email/route.ts` — send test email

Email templates to create:
| Template | Trigger | Recipients |
|----------|---------|------------|
| `inquiry-received.html` | Student submits inquiry | Student |
| `ai-response-ready.html` | AI finishes response | Student |
| `quote-request-created.html` | Student requests quotes | Nearby tutors |
| `quote-received.html` | Tutor submits quote | Student |
| `booking-confirmed.html` | Payment succeeds | Student + Tutor |
| `payout-sent.html` | Payout processed | Tutor |

Features:
- Resend API integration with retry logic (3 attempts)
- Queue emails via BullMQ for async processing
- Dynamic data injection via Handlebars
- Plain text fallback for each HTML email
- Unsubscribe link in footer

### 3. Notification Preferences ⚠ to implement
**File:** `apps/edumatch/app/api/me/notifications/route.ts`

Allow users to manage email preferences:
- `emailEnabled` — master toggle
- `notifyOnQuote` — tutor gets notified of new quote requests
- `notifyOnBooking` — both parties get booking confirmation
- `notifyOnPayout` — tutor gets payout notifications
- Store in `EduNotificationPreference` table

### 4. Email Testing & Debugging ⚠ to implement
**File:** `apps/edumatch/app/admin/emails/page.tsx`

Admin page for testing:
- List of all email templates with preview
- Send test email to yourself
- View email delivery status/logs
- Resend failed emails

## Acceptance Criteria
- [ ] Quote PDFs generate with professional styling
- [ ] PDFs are downloadable via signed URL (expires 1 hour)
- [ ] All 6 email templates render correctly
- [ ] Emails are queued and sent asynchronously
- [ ] Failed emails retry up to 3 times
- [ ] Users can disable email notifications in settings
- [ ] Admin can test/preview all emails
- [ ] Plain text fallback works for all templates

## Technical Notes
- **Puppeteer:** Use puppeteer-core with Chrome/Chromium installed in Docker
- **Resend:** Free tier: 100 emails/day. Set `RESEND_API_KEY` in env.
- **Templates:** Handlebars for HTML, with CSS inlined for email client compatibility
- **Images:** Use absolute URLs for images (DO Spaces public URL or base64 encoded)
- **Security:** Signed URLs for PDFs prevent unauthorized access

## Environment Variables Required
| Variable | Used by |
|---|---|
| `RESEND_API_KEY` | Email sending |
| `NEXT_PUBLIC_RESEND_FROM_EMAIL` | From address (e.g., "EduMatch <noreply@asafarim.com>") |
| `DO_SPACES_BUCKET` | PDF storage |
| `DO_SPACES_ENDPOINT` | PDF storage |
| `DO_SPACES_KEY` / `DO_SPACES_SECRET` | PDF storage |
| `PRESIGN_EXPIRES_SEC` | Signed URL expiry (default 3600) |

## Related Files
- `apps/edumatch/lib/server/stripe.ts` — webhook triggers email
- `apps/edumatch/app/api/quotes/[id]/pdf/route.ts` — PDF download stub
- `apps/edumatch/app/api/webhooks/stripe/route.ts` — payment success trigger
- `packages/db/prisma/schema.prisma` — `EduQuote`, `EduNotificationPreference`

## Estimated Effort
1 week (7 days)

## Blockers
- Resend account must be set up with verified domain
- Puppeteer requires Chrome/Chromium in Docker image
- Phase 4 payments must be working to trigger booking emails
