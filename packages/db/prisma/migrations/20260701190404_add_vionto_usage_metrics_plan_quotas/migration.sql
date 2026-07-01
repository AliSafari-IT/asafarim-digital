-- DropIndex
DROP INDEX "ViontoAlbum_collections_idx";

-- AlterTable
ALTER TABLE "ViontoAlbum" ADD COLUMN     "dateFrom" TIMESTAMP(3),
ADD COLUMN     "dateTo" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mood" TEXT,
ADD COLUMN     "occasion" TEXT,
ADD COLUMN     "people" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "privacyLevel" TEXT NOT NULL DEFAULT 'private',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ViontoAlbumItem" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ViontoAsset" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategory" TEXT,
ADD COLUMN     "moderationOutcome" TEXT,
ADD COLUMN     "moderationReason" TEXT;

-- AlterTable
ALTER TABLE "ViontoAudioTrack" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategory" TEXT,
ADD COLUMN     "moderationOutcome" TEXT,
ADD COLUMN     "moderationReason" TEXT;

-- AlterTable
ALTER TABLE "ViontoExport" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategory" TEXT,
ADD COLUMN     "moderationOutcome" TEXT,
ADD COLUMN     "moderationReason" TEXT;

-- AlterTable
ALTER TABLE "ViontoScript" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategory" TEXT,
ADD COLUMN     "moderationOutcome" TEXT,
ADD COLUMN     "moderationReason" TEXT,
ALTER COLUMN "musicOption" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ViontoVideoVersion" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "ViontoUsageMetric" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "metric" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "ViontoUsageMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViontoPlanQuota" (
    "id" TEXT NOT NULL,
    "planCode" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "limitValue" INTEGER NOT NULL,
    "overagePrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'USD',

    CONSTRAINT "ViontoPlanQuota_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ViontoUsageMetric_tenantId_idx" ON "ViontoUsageMetric"("tenantId");

-- CreateIndex
CREATE INDEX "ViontoUsageMetric_userId_idx" ON "ViontoUsageMetric"("userId");

-- CreateIndex
CREATE INDEX "ViontoUsageMetric_projectId_idx" ON "ViontoUsageMetric"("projectId");

-- CreateIndex
CREATE INDEX "ViontoUsageMetric_metric_idx" ON "ViontoUsageMetric"("metric");

-- CreateIndex
CREATE INDEX "ViontoUsageMetric_periodStart_idx" ON "ViontoUsageMetric"("periodStart");

-- CreateIndex
CREATE UNIQUE INDEX "ViontoUsageMetric_tenantId_metric_periodStart_key" ON "ViontoUsageMetric"("tenantId", "metric", "periodStart");

-- CreateIndex
CREATE INDEX "ViontoPlanQuota_planCode_idx" ON "ViontoPlanQuota"("planCode");

-- CreateIndex
CREATE INDEX "ViontoPlanQuota_metric_idx" ON "ViontoPlanQuota"("metric");

-- CreateIndex
CREATE UNIQUE INDEX "ViontoPlanQuota_planCode_metric_key" ON "ViontoPlanQuota"("planCode", "metric");

-- AddForeignKey
ALTER TABLE "ViontoUsageMetric" ADD CONSTRAINT "ViontoUsageMetric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoUsageMetric" ADD CONSTRAINT "ViontoUsageMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ViontoUsageMetric" ADD CONSTRAINT "ViontoUsageMetric_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ViontoProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
