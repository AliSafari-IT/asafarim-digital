# EduMatch Demo Setup Guide

This guide explains how to quickly set up and demonstrate the complete EduMatch flow using built-in seed data.

## Quick Start

### 1. Seed the Demo Data

From the repo root, run the database seed command:

```bash
pnpm --filter @asafarim/db db:seed
```

This creates three demo users with complete data for an end-to-end demonstration.

## Demo Users

| Role | Email | Description |
|------|-------|-------------|
| **Student** | `demo.student@example.com` | Has an inquiry with AI response, quote request, and confirmed booking |
| **Tutor** | `demo.tutor@example.com` | Verified tutor with wallet balance ($250 available, $150 pending), submitted quote |
| **Admin** | `demo.admin@example.com` | EduMatch admin with full access |

## Demo Data Details

The seed creates a complete end-to-end scenario:

### 1. Student Profile
- Undergraduate student interested in Mathematics and Computer Science
- Grade level: UNDERGRAD
- Preferred language: English

### 2. Tutor Profile
- Verified tutor (verifiedAt set)
- $50/hour rate
- Teaching subjects: Mathematics, Computer Science, Physics
- Levels: K12, UNDERGRAD
- Location: New York, NY (lat: 40.7128, lng: -74.0060)
- Service radius: 25km
- Stripe Connect: ACTIVE with demo account ID

### 3. Inquiry
- **Subject**: Mathematics
- **Grade Level**: UNDERGRAD
- **Description**: "I need help understanding derivatives and integrals for my calculus exam. Specifically, I'm struggling with chain rule applications and integration by parts. I have a midterm next week and would appreciate a clear explanation with practice problems."
- **Status**: ANSWERED
- **Moderation**: ALLOW (safe content)

### 4. AI Response
- **Model**: gpt-4o
- **Explanation**: Clear explanation of derivatives, chain rule, and integration by parts
- **Study Plan**: 3-step plan with practice problems
- **Next Steps**: Textbook chapter references
- **Tokens Used**: 450
- **Latency**: 1200ms

### 5. Quote Request
- **Subject**: Mathematics
- **Level**: UNDERGRAD
- **Status**: FULFILLED
- **Expires**: 7 days from seed

### 6. Quote
- **Hourly Rate**: $50/hour (5000 cents)
- **Estimated Hours**: 2
- **Total**: $100 (10000 cents)
- **Availability**: "Available weekdays 6-9 PM EST and weekends 10 AM-4 PM EST"
- **Tutor Note**: "I have extensive experience teaching calculus and can help you master these concepts before your midterm. I'll provide custom practice problems and walk through them with you."
- **Status**: ACCEPTED

### 7. Booking
- **Status**: CONFIRMED
- **Payment Status**: CAPTURED
- **Total**: $100.00
- **Platform Fee**: $15.00 (15%)
- **Tutor Payout**: $85.00
- **Scheduled**: 3 days from seed
- **Mode**: ONLINE
- **Stripe Payment Intent**: pi_demo_12345

### 8. Wallet (Tutor)
- **Available Balance**: $250.00 (25000 cents)
- **Pending**: $150.00 (15000 cents)
- **Lifetime Earnings**: $750.00 (75000 cents)
- **Currency**: USD
- **Payout Threshold**: $50.00 (5000 cents)

### 9. Notifications (5 total)
- Student: AI Response Ready (read)
- Student: New Quote Received (read)
- Student: Booking Confirmed (unread)
- Tutor: New Quote Request (read)
- Tutor: Booking Confirmed (unread)

## Demo Flow Walkthrough

### As the Student:

1. Sign in as **demo.student@example.com** (use Google OAuth in dev mode)
2. Navigate to `/student` - see the dashboard with existing inquiry
3. View inquiry at `/student/inquiry/demo_inquiry_001` - see AI explanation with study plan
4. Navigate to `/student/inquiry/demo_inquiry_001/quotes` - see the quote from Demo Tutor
5. Check `/student/bookings` - see confirmed booking with payment details
6. View `/student/wallet` (if applicable) - any refunds or credits

### As the Tutor:

1. Sign in as **demo.tutor@example.com**
2. Navigate to `/tutor` - see dashboard with stats:
   - Available balance: $250
   - Pending: $150
   - This month's earnings
3. Check `/tutor/wallet` - detailed wallet with transaction history
4. View `/tutor/bookings` - see the confirmed booking
5. Check `/tutor/quotes` - see submitted quotes
6. Navigate to `/tutor/requests` - see matching opportunities

### As the Admin:

1. Sign in as **demo.admin@example.com**
2. Navigate to `/admin/tutor-matching` - diagnostics and matching tools
3. Check `/admin/tutor-verifications` - tutor verification queue

## External Services in Demo Mode

For local development and demo purposes, external services have mock/test fallbacks:

### AI (OpenAI/Anthropic)
- Returns cached responses in test mode when API keys are missing
- The demo AI response is pre-seeded
- For real AI responses, set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

### Stripe
- Uses test mode with `pi_demo_*` and `ch_demo_*` IDs
- No real charges are made
- Set `STRIPE_SECRET_KEY` for real payment processing
- Set `STRIPE_WEBHOOK_SECRET` for webhook validation

### Email (Resend)
- Logs to console in development instead of sending
- Set `RESEND_API_KEY` for real email delivery

### File Storage (DigitalOcean Spaces)
- Uses local filesystem in development mode
- Set `SPACES_*` environment variables for S3-compatible storage

### Google Maps Geocoding
- Returns mock coordinates for known addresses
- Set `GOOGLE_MAPS_API_KEY` for real geocoding

## Environment Variables

See `apps/edumatch/.env.example` for all available environment variables.

Key variables for demo:

```env
# Required for basic functionality
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret
AUTH_URL=http://localhost:3005

# Optional - for real services
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
GOOGLE_MAPS_API_KEY=...
```

## Resetting Demo Data

To reset the demo data (if modified during testing):

```bash
# Reset the database (WARNING: deletes all data)
pnpm --filter @asafarim/db db:reset

# Re-seed with demo data
pnpm --filter @asafarim/db db:seed
```

## Testing the Flow

### Unit Tests
```bash
pnpm --filter edumatch test
```

### E2E Tests (Playwright)
```bash
pnpm --filter edumatch e2e
```

### Type Check
```bash
pnpm --filter edumatch typecheck
```

## Troubleshooting

### Database connection issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:pass@host:port/dbname`
- For PostGIS: Run `apps/edumatch/db/enable-postgis.sql`

### OAuth issues in development
- Use the `AUTH_TRUST_HOST=true` setting for local development
- Configure Google OAuth credentials in the portal app

### Missing demo users
- Check if seed ran successfully: `pnpm --filter @asafarim/db db:seed`
- Verify database connection and schema

## Related Documentation

- [EduMatch Project Plan](./edumatch-project-plan.md) - Full roadmap and architecture
- [EduMatch README](../apps/edumatch/README.md) - Development setup and API reference
