-- Add AI-generated image captions for Vionto story generation.
ALTER TABLE "ViontoAsset" ADD COLUMN "caption" TEXT;
ALTER TABLE "ViontoAsset" ADD COLUMN "captionProvider" TEXT;
ALTER TABLE "ViontoAsset" ADD COLUMN "captionModel" TEXT;
ALTER TABLE "ViontoAsset" ADD COLUMN "captionGeneratedAt" TIMESTAMP(3);
