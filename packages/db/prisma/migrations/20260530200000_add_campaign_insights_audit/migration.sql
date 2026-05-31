-- AlterTable
ALTER TABLE "MarketingCampaign" ADD COLUMN     "cpaTargetCents" INTEGER,
ADD COLUMN     "endsAt" TIMESTAMP(3),
ADD COLUMN     "lastEditedAt" TIMESTAMP(3),
ADD COLUMN     "lastEditedBy" TEXT,
ADD COLUMN     "lastEditedById" TEXT;
