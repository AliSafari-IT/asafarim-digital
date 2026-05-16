-- Add storyMode to ViontoProject and musicOption to ViontoExport
ALTER TABLE "ViontoProject"
  ADD COLUMN IF NOT EXISTS "storyMode" TEXT DEFAULT 'memory_film';

ALTER TABLE "ViontoExport"
  ADD COLUMN IF NOT EXISTS "musicOption" TEXT;
