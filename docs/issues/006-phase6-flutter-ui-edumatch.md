# Phase 6 — EduMatch Flutter Mobile App

**Status:** Ready for development  
**Priority:** High  
**Assignee:** TBD  
**Labels:** `enhancement`, `edumatch`, `flutter`, `mobile`, `ui`

## Objective
Build a Flutter mobile app for EduMatch that provides core student and tutor functionality on iOS and Android.

## Background
Phase 5 (PDFs + Email Notifications) is complete:
- ✅ Quote PDF generation with Puppeteer
- ✅ Email templates (6 types) with Resend
- ✅ Notification preferences API
- ✅ Admin email testing page

## Tasks

### 1. Flutter Project Setup ⚠ to implement
**Repository:** `apps/mobile/` (new Flutter project)

Initialize Flutter 3.x project:
- `flutter create --org com.asafarim --project-name edumatch mobile/`
- Configure for iOS + Android + Web
- Set up Riverpod for state management
- Configure `flutter_dotenv` for environment variables
- Add shared package dependencies (auth, models)

**Key dependencies:**
```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_riverpod: ^2.x
  dio: ^5.x  # HTTP client
  flutter_stripe: ^10.x  # Stripe SDK
  image_picker: ^1.x  # Camera for intake
  record: ^5.x  # Voice recording
  google_maps_flutter: ^2.x  # Maps for matching
  firebase_messaging: ^14.x  # Push notifications
```

### 2. Auth & Onboarding ⚠ to implement
**Screens:**
- `OnboardingScreen` — role selection (Student/Tutor)
- `SignInScreen` — OAuth with Google (shared auth with web)
- `StudentProfileScreen` — grade level, subjects (onboarding)
- `TutorProfileScreen` — bio, subjects, hourly rate (onboarding)

Features:
- Persist auth token securely (Flutter Secure Storage)
- Auto-redirect to home if already signed in
- Smooth onboarding flow with progress indicator

### 3. Student Screens ⚠ to implement
**Screens:**
- `StudentHomeScreen` — past inquiries list, "Ask Question" CTA
- `NewInquiryScreen` — text + image + voice capture
  - Camera/gallery for problem photos
  - Voice recording with Whisper transcription
  - Text description input
- `AIResponseScreen` — streamed explanation display
  - Real-time markdown rendering
  - "Get Tutor Quotes" button
- `QuotesScreen` — side-by-side quote comparison (up to 5)
  - Tutor cards: photo, rating, rate, bio excerpt
  - Swipe/scroll to compare
  - "Select & Book" CTA
- `BookingScreen` — Stripe payment sheet integration
  - Display quote summary
  - Native Stripe payment UI
  - Booking confirmation

### 4. Tutor Screens ⚠ to implement
**Screens:**
- `TutorHomeScreen` — incoming requests, wallet, earnings
- `QuoteRequestsScreen` — list of open requests
  - Card per request: subject, student level, description excerpt
  - "Submit Quote" form: rate, hours, availability slots
- `QuoteSubmittedScreen` — confirmation + next steps
- `WalletScreen` — balance, pending, transaction history
  - Request payout button
  - Stripe Connect onboarding status
- `BookingsScreen` — upcoming sessions list
  - Calendar integration
  - Session details + student contact

### 5. Shared Components ⚠ to implement
**Widgets:**
- `AppSwitcher` — cross-app navigation (reuse from web)
- `RoleBadge` — Student/Tutor indicator
- `StatusChip` — inquiry/booking status badges
- `PriceTag` — formatted pricing display
- `RatingStars` — tutor rating display
- `Avatar` — user profile photos
- `LoadingOverlay` — async operation feedback
- `ErrorToast` — error notifications

### 6. API Integration ⚠ to implement
**Services:**
- `AuthService` — sign in/out, token refresh
- `InquiryService` — create inquiry, list, get details
- `QuoteService` — submit quote, list quotes, accept/decline
- `BookingService` — checkout, payment confirmation
- `WalletService` — balance, transactions, payout request
- `NotificationService` — FCM token registration, in-app notifications

### 7. Push Notifications ⚠ to implement
**Setup:**
- Firebase project configuration
- FCM token registration on app launch
- Handle notification types:
  - `QUOTE_REQUEST` — new request for tutor
  - `QUOTE_SUBMITTED` — new quote for student
  - `BOOKING_CONFIRMED` — session booked
  - `PAYOUT_SENT` — tutor payout processed

### 8. Testing & Deployment ⚠ to implement
**Tasks:**
- Unit tests for services (mock HTTP responses)
- Widget tests for critical screens
- Integration tests: full inquiry → quote → booking flow
- iOS TestFlight deployment
- Android Play Store Internal Track

## Acceptance Criteria
- [ ] Student can create inquiry with photo/voice
- [ ] AI response streams in real-time on mobile
- [ ] Student can view and select from multiple tutor quotes
- [ ] Stripe payment sheet works on iOS/Android
- [ ] Tutor can view incoming quote requests
- [ ] Tutor can submit quote with rate and availability
- [ ] Push notifications arrive for key events
- [ ] Wallet displays correct balance and transactions
- [ ] App passes basic accessibility checks
- [ ] TestFlight/Play Store Internal builds available

## Technical Notes
- **State Management:** Riverpod (reactive, testable)
- **HTTP Client:** Dio with interceptors for auth tokens
- **Offline:** Cache recent inquiries/quotes locally (Hive/SQLite)
- **Images:** Compress before upload (max 2MB), show placeholders
- **Stripe:** Use `flutter_stripe` for native payment sheets
- **Maps:** Google Maps Flutter plugin for tutor location display
- **Push:** Firebase Cloud Messaging with custom notification channels

## Environment Variables Required
| Variable | Used by |
|---|---|
| `NEXT_PUBLIC_EDUMATCH_URL` | API base URL |
| `STRIPE_PUBLISHABLE_KEY` | Stripe payment sheet |
| `FIREBASE_PROJECT_ID` | Push notifications |
| `FIREBASE_API_KEY` | Firebase services |
| `GOOGLE_MAPS_API_KEY` | Maps widget |

## Related Files
- `apps/edumatch/` — Backend API (already complete)
- `packages/auth/` — Shared auth (reuse patterns)
- `packages/db/prisma/schema.prisma` — Data models reference

## Estimated Effort
2–3 weeks (10–15 days)

## Blockers
- Phase 5 APIs must be deployed and stable
- Firebase project setup with Android/iOS apps
- Stripe account configured for mobile SDK
- iOS Developer Account ($99/year) for TestFlight
- Google Play Developer Account ($25 one-time)

## Learning Resources
- [Flutter Official Docs](https://docs.flutter.dev/)
- [Riverpod State Management](https://riverpod.dev/)
- [Stripe Flutter SDK](https://stripe.com/docs/mobile/flutter)
- [Firebase Flutter Setup](https://firebase.google.com/docs/flutter/setup)
