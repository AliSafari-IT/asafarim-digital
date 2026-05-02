# Phase 7 — EduMatch Polish + Ship

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `testing`, `deployment`, `polish`

## Objective
Polish the EduMatch platform and prepare for production release: comprehensive testing, real device testing, legal pages, and app store deployment.

## Background
Phase 6 (Flutter Mobile App) is complete:
- ✅ Flutter project setup with Riverpod, Dio, Stripe
- ✅ Onboarding and auth screens (Google Sign In)
- ✅ Student screens: home, new inquiry, AI response, quotes, booking
- ✅ Tutor screens: home, quote requests, wallet, bookings
- ✅ Core widgets and API service with retry logic
- ✅ Data models with freezed

## Tasks

### 1. E2E Testing (Web) ⚠ to implement
**Files:**
- `apps/edumatch/playwright.config.ts` — Playwright configuration
- `apps/edumatch/e2e/student-flow.spec.ts` — Student journey tests
- `apps/edumatch/e2e/tutor-flow.spec.ts` — Tutor journey tests
- `apps/edumatch/e2e/checkout.spec.ts` — Stripe checkout tests

Test scenarios:
- Student: sign up → create inquiry → view AI response → request quotes
- Tutor: sign up → submit quote → view wallet → request payout
- Booking: select quote → checkout → payment confirmation
- Auth: sign in, role selection, profile completion

**Acceptance:** All critical flows pass in CI

### 2. API Integration Tests ⚠ to implement
**Files:**
- `apps/edumatch/__tests__/api/inquiries.test.ts`
- `apps/edumatch/__tests__/api/quotes.test.ts`
- `apps/edumatch/__tests__/api/wallet.test.ts`
- `apps/edumatch/__tests__/api/webhooks.test.ts`

Test coverage:
- All API routes return expected status codes
- Database state changes correctly after operations
- Stripe webhook handlers are idempotent
- Auth middleware protects sensitive endpoints

### 3. Real Device Testing ⚠ to implement
**Testing matrix:**
- iOS: iPhone 12, 14, 15 (latest iOS)
- Android: Pixel 6, Samsung S23 (latest Android)
- Web: Chrome, Safari, Firefox (desktop + mobile)

Test scenarios:
- Camera permission for inquiry photos
- Voice recording and playback
- Push notification delivery
- Payment sheet on real devices
- Offline behavior and error states

### 4. Performance & Accessibility ⚠ to implement
**Performance:**
- Lighthouse score ≥ 90 on all pages
- First Contentful Paint < 1.5s
- API response time P95 < 500ms
- Image optimization (WebP, lazy loading)

**Accessibility:**
- WCAG 2.1 AA compliance
- Screen reader testing
- Keyboard navigation
- Color contrast verification
- Focus indicators

### 5. Legal Pages ⚠ to implement
**Files:**
- `apps/edumatch/app/(legal)/privacy/page.tsx` — Privacy Policy
- `apps/edumatch/app/(legal)/terms/page.tsx` — Terms of Service
- `apps/edumatch/app/(legal)/cookies/page.tsx` — Cookie Policy

Content:
- Data collection practices (GDPR compliant)
- Third-party services (Stripe, OpenAI, Resend)
- User rights (access, deletion, portability)
- Cookie usage and consent
- Contact information for privacy inquiries

### 6. App Store Deployment ⚠ to implement
**iOS (TestFlight):**
- App Store Connect setup
- App icon and screenshots (6.5", 5.5", iPad)
- App description and keywords
- Privacy manifest (required iOS 17.4+)
- TestFlight internal testing (add 5 testers)

**Android (Play Console):**
- Google Play Console setup
- App bundle (AAB) build
- Store listing with screenshots
- Content rating questionnaire
- Internal testing track

### 7. Monitoring & Analytics ⚠ to implement
**Monitoring:**
- Sentry error tracking (already configured)
- PostHog product analytics
- Custom events: inquiry created, quote submitted, booking completed
- Performance monitoring: API latency, AI response time

**Alerting:**
- Error rate > 1% → Slack notification
- API downtime → PagerDuty (if critical)
- Stripe webhook failures → Immediate alert

### 8. Beta Launch ⚠ to implement
**Invite list:**
- 5 friends/family for soft launch
- Feedback form (Google Forms or Typeform)
- Known issues list in app

**Feedback collection:**
- In-app feedback widget
- Bug report with screenshot capability
- NPS survey after first booking

## Acceptance Criteria
- [ ] All E2E tests pass in CI
- [ ] API integration tests have >80% coverage
- [ ] Lighthouse score ≥ 90 on critical pages
- [ ] Privacy policy and terms pages live
- [ ] iOS app on TestFlight (internal testing)
- [ ] Android app on Play Console (internal testing)
- [ ] Sentry + PostHog receiving events
- [ ] 5 beta users invited and onboarded
- [ ] Known issues documented in README

## Technical Notes
- **Playwright:** Use for critical user flows only (not pixel-perfect)
- **Test data:** Seed realistic data for E2E tests
- **Stripe test mode:** Use test keys for all automated tests
- **Device testing:** Use BrowserStack or physical devices
- **Privacy policy:** Use a template generator (iubenda or similar)

## Environment Variables Required
| Variable | Used by |
|---|---|
| `SENTRY_DSN` | Error tracking |
| `POSTHOG_KEY` | Analytics |
| `PLAYWRIGHT_TEST_BASE_URL` | E2E tests |

## Related Files
- `apps/edumatch/.github/workflows/` — CI/CD for tests
- `apps/mobile/ios/` — iOS configuration
- `apps/mobile/android/` — Android configuration

## Estimated Effort
1 week (5-7 days)

## Blockers
- App Store review process (1-2 days)
- Google Play review (1-3 days)
- Physical device access for testing
- Beta user availability

## Definition of Done
EduMatch is "shipped" when:
1. Core web flows work end-to-end with real Stripe test transactions
2. Mobile apps are on TestFlight/Play Console internal tracks
3. 5 users have successfully completed at least one booking
4. No P0 or P1 bugs open
5. Monitoring shows <1% error rate over 7 days
