-- Add storyMode and emotionalTone snapshot columns to ViontoExport
-- These are snapshotted at render time so that library display is immune
-- to later edits on ViontoProject or ViontoVideoVersion.

ALTER TABLE "public"."ViontoExport" ADD COLUMN IF NOT EXISTS "storyMode" TEXT;
ALTER TABLE "public"."ViontoExport" ADD COLUMN IF NOT EXISTS "emotionalTone" TEXT;
