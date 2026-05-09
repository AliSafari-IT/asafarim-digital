-- Add user-facing Vionto export metadata for library filtering and filenames.
ALTER TABLE "ViontoExport"
  ADD COLUMN IF NOT EXISTS "filename" TEXT,
  ADD COLUMN IF NOT EXISTS "userMode" TEXT,
  ADD COLUMN IF NOT EXISTS "renderMode" TEXT,
  ADD COLUMN IF NOT EXISTS "aspectRatio" TEXT,
  ADD COLUMN IF NOT EXISTS "aspectLabel" TEXT,
  ADD COLUMN IF NOT EXISTS "storyKeywords" JSONB,
  ADD COLUMN IF NOT EXISTS "previewTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "previewSubtitle" TEXT;

CREATE INDEX IF NOT EXISTS "ViontoExport_userId_createdAt_idx"
  ON "ViontoExport" ("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "ViontoExport_userId_userMode_createdAt_idx"
  ON "ViontoExport" ("userId", "userMode", "createdAt");

CREATE INDEX IF NOT EXISTS "ViontoExport_userId_aspectRatio_createdAt_idx"
  ON "ViontoExport" ("userId", "aspectRatio", "createdAt");
