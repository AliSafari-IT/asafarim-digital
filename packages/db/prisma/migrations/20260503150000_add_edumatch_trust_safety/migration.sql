-- EduMatch trust, safety, and quality hardening (issue #014)
--
-- Adds:
--   * Moderation columns on EduInquiry and EduAiResponse
--   * EduTutorVerification (admin-managed verification workflow)
--   * EduNotificationPreference (per-user notification opt-in/out)
--   * EduAuditEvent (EduMatch-specific audit trail)
--
-- All changes are additive: existing fields/values remain untouched.

-- ── EduInquiry ────────────────────────────────────────────────
ALTER TABLE "EduInquiry"
    ADD COLUMN IF NOT EXISTS "moderationOutcome"  TEXT,
    ADD COLUMN IF NOT EXISTS "moderationCategory" TEXT,
    ADD COLUMN IF NOT EXISTS "moderationReason"   TEXT;

CREATE INDEX IF NOT EXISTS "EduInquiry_moderationOutcome_idx"
    ON "EduInquiry" ("moderationOutcome");

-- ── EduAiResponse ─────────────────────────────────────────────
ALTER TABLE "EduAiResponse"
    ADD COLUMN IF NOT EXISTS "moderationOutcome"  TEXT,
    ADD COLUMN IF NOT EXISTS "moderationCategory" TEXT,
    ADD COLUMN IF NOT EXISTS "moderationReason"   TEXT;

CREATE INDEX IF NOT EXISTS "EduAiResponse_moderationOutcome_idx"
    ON "EduAiResponse" ("moderationOutcome");

-- ── EduTutorVerification ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS "EduTutorVerification" (
    "id"           TEXT NOT NULL,
    "tutorId"      TEXT NOT NULL,
    "reviewerId"   TEXT,
    "status"       TEXT NOT NULL DEFAULT 'PENDING',
    "checklist"    JSONB,
    "adminNotes"   TEXT,
    "tutorMessage" TEXT,
    "resolvedAt"   TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EduTutorVerification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EduTutorVerification_tutorId_idx"    ON "EduTutorVerification" ("tutorId");
CREATE INDEX IF NOT EXISTS "EduTutorVerification_status_idx"     ON "EduTutorVerification" ("status");
CREATE INDEX IF NOT EXISTS "EduTutorVerification_reviewerId_idx" ON "EduTutorVerification" ("reviewerId");
CREATE INDEX IF NOT EXISTS "EduTutorVerification_createdAt_idx"  ON "EduTutorVerification" ("createdAt");

ALTER TABLE "EduTutorVerification"
    ADD CONSTRAINT "EduTutorVerification_tutorId_fkey"
    FOREIGN KEY ("tutorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EduTutorVerification"
    ADD CONSTRAINT "EduTutorVerification_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ── EduNotificationPreference ─────────────────────────────────
CREATE TABLE IF NOT EXISTS "EduNotificationPreference" (
    "userId"                    TEXT NOT NULL,
    "inAppInquiryReceived"      BOOLEAN NOT NULL DEFAULT true,
    "inAppAiResponseReady"      BOOLEAN NOT NULL DEFAULT true,
    "inAppQuoteReceived"        BOOLEAN NOT NULL DEFAULT true,
    "inAppBookingConfirmed"     BOOLEAN NOT NULL DEFAULT true,
    "inAppCancellationUpdate"   BOOLEAN NOT NULL DEFAULT true,
    "inAppDisputeUpdate"        BOOLEAN NOT NULL DEFAULT true,
    "inAppPayoutSent"           BOOLEAN NOT NULL DEFAULT true,
    "emailInquiryReceived"      BOOLEAN NOT NULL DEFAULT true,
    "emailAiResponseReady"      BOOLEAN NOT NULL DEFAULT false,
    "emailQuoteReceived"        BOOLEAN NOT NULL DEFAULT true,
    "emailBookingConfirmed"     BOOLEAN NOT NULL DEFAULT true,
    "emailCancellationUpdate"   BOOLEAN NOT NULL DEFAULT true,
    "emailDisputeUpdate"        BOOLEAN NOT NULL DEFAULT true,
    "emailPayoutSent"           BOOLEAN NOT NULL DEFAULT true,
    "createdAt"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                 TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EduNotificationPreference_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "EduNotificationPreference"
    ADD CONSTRAINT "EduNotificationPreference_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ── EduAuditEvent ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "EduAuditEvent" (
    "id"        TEXT NOT NULL,
    "actorId"   TEXT,
    "actorRole" TEXT,
    "action"    TEXT NOT NULL,
    "entity"    TEXT NOT NULL,
    "entityId"  TEXT,
    "prevState" TEXT,
    "nextState" TEXT,
    "reason"    TEXT,
    "metadata"  JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EduAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EduAuditEvent_actorId_idx"   ON "EduAuditEvent" ("actorId");
CREATE INDEX IF NOT EXISTS "EduAuditEvent_entity_idx"    ON "EduAuditEvent" ("entity");
CREATE INDEX IF NOT EXISTS "EduAuditEvent_entityId_idx"  ON "EduAuditEvent" ("entityId");
CREATE INDEX IF NOT EXISTS "EduAuditEvent_action_idx"    ON "EduAuditEvent" ("action");
CREATE INDEX IF NOT EXISTS "EduAuditEvent_createdAt_idx" ON "EduAuditEvent" ("createdAt");

ALTER TABLE "EduAuditEvent"
    ADD CONSTRAINT "EduAuditEvent_actorId_fkey"
    FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;
