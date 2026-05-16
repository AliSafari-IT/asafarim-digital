-- Add missing columns to ViontoProject
ALTER TABLE "ViontoProject"
  ADD COLUMN IF NOT EXISTS "storyMode" TEXT DEFAULT 'memory_film',
  ADD COLUMN IF NOT EXISTS "emotionalTone" TEXT DEFAULT 'nostalgic',
  ADD COLUMN IF NOT EXISTS "musicOption" TEXT DEFAULT 'no_music',
  ADD COLUMN IF NOT EXISTS "musicTrackId" TEXT,
  ADD COLUMN IF NOT EXISTS "musicUploadKey" TEXT,
  ADD COLUMN IF NOT EXISTS "musicMetadata" JSONB;

-- Add missing columns to ViontoExport
ALTER TABLE "ViontoExport"
  ADD COLUMN IF NOT EXISTS "musicOption" TEXT,
  ADD COLUMN IF NOT EXISTS "musicTrackId" TEXT,
  ADD COLUMN IF NOT EXISTS "musicMetadata" JSONB;
