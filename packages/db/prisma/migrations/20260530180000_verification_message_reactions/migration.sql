-- Add reactions JSONB column to EduVerificationMessage.
-- Stores { [emoji]: userId[] } where emoji is one of the supported set.
ALTER TABLE "EduVerificationMessage" ADD COLUMN "reactions" JSONB;
