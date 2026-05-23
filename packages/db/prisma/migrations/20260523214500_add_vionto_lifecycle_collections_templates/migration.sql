ALTER TABLE "ViontoAlbum"
  ADD COLUMN "lifecycleStage" TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN "collections" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;

UPDATE "ViontoAlbum" a
SET "lifecycleStage" = 'photos_uploaded'
WHERE EXISTS (
  SELECT 1 FROM "ViontoAlbumItem" i WHERE i."albumId" = a."id"
);

UPDATE "ViontoAlbum" a
SET
  "isFavorite" = true,
  "collections" = ARRAY['favorites']::TEXT[]
WHERE EXISTS (
  SELECT 1 FROM "ViontoAlbumItem" i WHERE i."albumId" = a."id" AND i."favorite" = true
);

CREATE INDEX "ViontoAlbum_lifecycleStage_idx" ON "ViontoAlbum"("lifecycleStage");
CREATE INDEX "ViontoAlbum_isFavorite_idx" ON "ViontoAlbum"("isFavorite");
CREATE INDEX "ViontoAlbum_collections_idx" ON "ViontoAlbum" USING GIN ("collections");

ALTER TABLE "ViontoVideoVersion"
  ADD COLUMN "templateId" TEXT,
  ADD COLUMN "templateSettings" JSONB;

CREATE INDEX "ViontoVideoVersion_templateId_idx" ON "ViontoVideoVersion"("templateId");
