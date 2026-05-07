-- AlterTable
ALTER TABLE "ViontoProject" ADD COLUMN     "resolution" TEXT;

-- AlterTable
ALTER TABLE "ViontoScript" ADD COLUMN     "completionTokens" INTEGER,
ADD COLUMN     "latencyMs" INTEGER,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "promptTokens" INTEGER,
ADD COLUMN     "totalTokens" INTEGER;
