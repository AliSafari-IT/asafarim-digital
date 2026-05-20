-- CreateTable: ViontoAlbum
-- Logical album collections over project assets (no image file duplication).
-- Every project gets one base album (isBase=true) created automatically.
CREATE TABLE "ViontoAlbum" (
    "id"           TEXT        NOT NULL,
    "projectId"    TEXT        NOT NULL,
    "userId"       TEXT        NOT NULL,
    "name"         TEXT        NOT NULL,
    "description"  TEXT,
    "isBase"       BOOLEAN     NOT NULL DEFAULT false,
    "coverAssetId" TEXT,
    "metadata"     JSONB,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViontoAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ViontoAlbumItem
-- One row per image-in-album reference. Holds per-album orderIndex and
-- user-curated semantic metadata (flexible JSON, max 8 KB).
CREATE TABLE "ViontoAlbumItem" (
    "id"         TEXT        NOT NULL,
    "albumId"    TEXT        NOT NULL,
    "assetId"    TEXT        NOT NULL,
    "orderIndex" INTEGER     NOT NULL DEFAULT 0,
    "metadata"   JSONB,
    "hidden"     BOOLEAN     NOT NULL DEFAULT false,
    "favorite"   BOOLEAN     NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ViontoAlbumItem_pkey" PRIMARY KEY ("id")
);

-- Indexes: ViontoAlbum
CREATE INDEX "ViontoAlbum_projectId_idx"        ON "ViontoAlbum"("projectId");
CREATE INDEX "ViontoAlbum_userId_idx"            ON "ViontoAlbum"("userId");
CREATE INDEX "ViontoAlbum_projectId_isBase_idx"  ON "ViontoAlbum"("projectId", "isBase");

-- Indexes: ViontoAlbumItem
CREATE UNIQUE INDEX "ViontoAlbumItem_albumId_assetId_key"     ON "ViontoAlbumItem"("albumId", "assetId");
CREATE INDEX        "ViontoAlbumItem_albumId_orderIndex_idx"  ON "ViontoAlbumItem"("albumId", "orderIndex");
CREATE INDEX        "ViontoAlbumItem_assetId_idx"             ON "ViontoAlbumItem"("assetId");

-- Foreign keys
ALTER TABLE "ViontoAlbum"
    ADD CONSTRAINT "ViontoAlbum_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViontoAlbumItem"
    ADD CONSTRAINT "ViontoAlbumItem_albumId_fkey"
    FOREIGN KEY ("albumId") REFERENCES "ViontoAlbum"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ViontoAlbumItem"
    ADD CONSTRAINT "ViontoAlbumItem_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "ViontoAsset"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
