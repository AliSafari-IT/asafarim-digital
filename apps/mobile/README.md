# EduMatch Mobile

Flutter companion app for EduMatch students and tutors. It targets the same
domain as `apps/edumatch` and is intended for mobile-first inquiry intake,
AI responses, quote review, bookings, tutor requests, and wallet views.

Full roadmap: [docs/edumatch-project-plan.md](../../docs/edumatch-project-plan.md)

## Status

Current state: Flutter MVP scaffold.

Implemented:

- Flutter project with Riverpod, Dio, secure storage, Hive, Stripe, Google/Apple
  sign-in dependencies, location, media, and notification packages.
- Role onboarding and sign-in screens.
- Student screens for home, new inquiry, AI response, quotes, and booking.
- Tutor screens for home, quote requests, bookings, and wallet.
- Shared models for users, inquiries, and quotes.
- API service with retry support.
- Loading overlay and role card widgets.

In progress:

- Real device validation on iOS and Android.
- Auth token handoff against the web/API session model.
- Stripe PaymentSheet integration against EduMatch checkout APIs.
- Push notification setup.
- Store-track build configuration.

## Stack

- Flutter 3.x
- Dart 3.x
- Riverpod for state management
- Dio for HTTP and retry handling
- Flutter secure storage and Hive for local state
- Freezed/json_serializable for models
- Stripe, Google Sign-In, Apple Sign-In, Firebase Messaging, maps, and media
  packages prepared in `pubspec.yaml`

## Local Development

From this app directory:

```bash
flutter pub get
flutter run
```

For web testing:

```bash
flutter run -d chrome
```

For static checks:

```bash
flutter analyze
flutter test
```

## App Structure

```text
apps/mobile/
  lib/
    app.dart
    main.dart
    models/
    providers/
    screens/
      auth/
      onboarding/
      student/
      tutor/
    services/
    widgets/
```

## API Dependency

The mobile app depends on the EduMatch web/API app:

- Local API: `http://localhost:3005`
- Health: `http://localhost:3005/api/health`
- Student APIs: inquiries, AI responses, quote comparison, checkout.
- Tutor APIs: profile, quote requests, quote submission, bookings, wallet.

Use the same backend behavior documented in
[apps/edumatch/README.md](../edumatch/README.md).

## Environment

`pubspec.yaml` currently includes `.env` as an asset. Keep secrets out of the
mobile bundle; only public or environment-specific API base URLs belong there.

Suggested local values:

```env
EDUMATCH_API_URL=http://localhost:3005
STRIPE_PUBLISHABLE_KEY=pk_test_...
GOOGLE_MAPS_API_KEY=...
```

## Documentation Tasks

- Keep mobile status in sync with the Phase 6 and Phase 7 sections of the
  EduMatch project plan.
- Document any store-specific setup when TestFlight or Play Console tracks are
  configured.
