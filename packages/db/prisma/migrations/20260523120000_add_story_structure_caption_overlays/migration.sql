-- Add story structure and caption overlay settings to ViontoVideoVersion
-- These are JSON columns storing structured settings per video version.

ALTER TABLE "ViontoVideoVersion"
  ADD COLUMN "storyStructure" JSONB,
  ADD COLUMN "captionOverlaySettings" JSONB;
