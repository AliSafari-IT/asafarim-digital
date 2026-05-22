-- CreateTable: ViontoVideoVersion
-- One configured video output from a project.  Owns the creative settings
-- that were previously overloaded on ViontoProject (mode, storyMode,
-- emotionalTone, visualStyle, music, subtitles, aspect ratio, duration).
-- Scripts, audio tracks, render jobs, and exports link to a version via
-- the new nullable versionId FK (kept alongside projectId for compatibility).

CREATE TABLE "ViontoVideoVersion" (
    "id"                    TEXT         NOT NULL,
    "projectId"             TEXT         NOT NULL,
    "userId"                TEXT         NOT NULL,
    "albumId"               TEXT,
    "name"                  TEXT         NOT NULL DEFAULT 'Version 1',
    "mode"                  TEXT         NOT NULL DEFAULT 'story',
    "storyMode"             TEXT         DEFAULT 'memory_film',
    "emotionalTone"         TEXT         DEFAULT 'nostalgic',
    "visualStyle"           TEXT         DEFAULT 'clean_modern_slideshow',
    "subtitleSettings"      JSONB,
    "musicOption"           TEXT         DEFAULT 'no_music',
    "musicTrackId"          TEXT,
    "musicUploadKey"        TEXT,
    "musicMetadata"         JSONB,
    "aspectRatio"           TEXT         NOT NULL DEFAULT '16:9',
    "resolution"            TEXT,
    "targetDurationSeconds" INTEGER,
    "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViontoVideoVersion_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "ViontoVideoVersion_projectId_idx" ON "ViontoVideoVersion"("projectId");
CREATE INDEX "ViontoVideoVersion_userId_idx"    ON "ViontoVideoVersion"("userId");
CREATE INDEX "ViontoVideoVersion_albumId_idx"   ON "ViontoVideoVersion"("albumId");

-- FK: ViontoVideoVersion -> ViontoProject (cascade delete)
ALTER TABLE "ViontoVideoVersion"
    ADD CONSTRAINT "ViontoVideoVersion_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- FK: ViontoVideoVersion -> ViontoAlbum (set null on delete)
ALTER TABLE "ViontoVideoVersion"
    ADD CONSTRAINT "ViontoVideoVersion_albumId_fkey"
    FOREIGN KEY ("albumId") REFERENCES "ViontoAlbum"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Add versionId columns to child tables ──────────────────────

ALTER TABLE "ViontoScript"     ADD COLUMN "versionId" TEXT;
ALTER TABLE "ViontoAudioTrack" ADD COLUMN "versionId" TEXT;
ALTER TABLE "ViontoRenderJob"  ADD COLUMN "versionId" TEXT;
ALTER TABLE "ViontoExport"     ADD COLUMN "versionId" TEXT;

-- Indexes on the new FK columns
CREATE INDEX "ViontoScript_versionId_idx"     ON "ViontoScript"("versionId");
CREATE INDEX "ViontoAudioTrack_versionId_idx" ON "ViontoAudioTrack"("versionId");
CREATE INDEX "ViontoRenderJob_versionId_idx"  ON "ViontoRenderJob"("versionId");
CREATE INDEX "ViontoExport_versionId_idx"     ON "ViontoExport"("versionId");

-- FK constraints (set null on delete so child records survive version deletion)
ALTER TABLE "ViontoScript"
    ADD CONSTRAINT "ViontoScript_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "ViontoVideoVersion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViontoAudioTrack"
    ADD CONSTRAINT "ViontoAudioTrack_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "ViontoVideoVersion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViontoRenderJob"
    ADD CONSTRAINT "ViontoRenderJob_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "ViontoVideoVersion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ViontoExport"
    ADD CONSTRAINT "ViontoExport_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "ViontoVideoVersion"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- ── Data migration ─────────────────────────────────────────────
-- For every existing project, create one default ViontoVideoVersion and
-- backfill versionId on all child records.
--
-- gen_random_uuid() produces a v4 UUID which is safe as a cuid-like PK.
-- We use a CTE to ensure atomicity within a single statement per table.

-- Step 1: Create one ViontoVideoVersion per project, copying creative
-- settings and linking to the base album (if one exists).
INSERT INTO "ViontoVideoVersion" (
    "id", "projectId", "userId", "albumId", "name",
    "mode", "storyMode", "emotionalTone", "visualStyle",
    "subtitleSettings", "musicOption", "musicTrackId",
    "musicUploadKey", "musicMetadata",
    "aspectRatio", "resolution", "targetDurationSeconds",
    "createdAt", "updatedAt"
)
SELECT
    -- Use project id prefixed with 'vv_' to generate a deterministic,
    -- collision-free id that we can reference in the backfill steps below.
    'vv_' || p."id",
    p."id",
    p."userId",
    ba."id",                     -- base album id (may be NULL)
    'Version 1',
    p."mode",
    p."storyMode",
    p."emotionalTone",
    p."visualStyle",
    p."subtitleSettings",
    p."musicOption",
    p."musicTrackId",
    p."musicUploadKey",
    p."musicMetadata",
    p."aspectRatio",
    p."resolution",
    p."targetDurationSeconds",
    p."createdAt",
    p."updatedAt"
FROM "ViontoProject" p
LEFT JOIN "ViontoAlbum" ba
    ON ba."projectId" = p."id" AND ba."isBase" = true;

-- Step 2: Backfill versionId on child tables.
UPDATE "ViontoScript"     SET "versionId" = 'vv_' || "projectId" WHERE "versionId" IS NULL;
UPDATE "ViontoAudioTrack" SET "versionId" = 'vv_' || "projectId" WHERE "versionId" IS NULL;
UPDATE "ViontoRenderJob"  SET "versionId" = 'vv_' || "projectId" WHERE "versionId" IS NULL;
UPDATE "ViontoExport"     SET "versionId" = 'vv_' || "projectId" WHERE "versionId" IS NULL;
