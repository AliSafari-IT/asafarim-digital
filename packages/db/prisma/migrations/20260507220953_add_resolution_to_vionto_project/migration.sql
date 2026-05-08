-- AlterTable
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ViontoProject' AND column_name = 'resolution'
  ) THEN
    ALTER TABLE "ViontoProject" ADD COLUMN "resolution" TEXT;
  END IF;
END $$;

-- AlterTable
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ViontoScript' AND column_name = 'completionTokens'
  ) THEN
    ALTER TABLE "ViontoScript" ADD COLUMN "completionTokens" INTEGER;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ViontoScript' AND column_name = 'latencyMs'
  ) THEN
    ALTER TABLE "ViontoScript" ADD COLUMN "latencyMs" INTEGER;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ViontoScript' AND column_name = 'model'
  ) THEN
    ALTER TABLE "ViontoScript" ADD COLUMN "model" TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ViontoScript' AND column_name = 'promptTokens'
  ) THEN
    ALTER TABLE "ViontoScript" ADD COLUMN "promptTokens" INTEGER;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ViontoScript' AND column_name = 'totalTokens'
  ) THEN
    ALTER TABLE "ViontoScript" ADD COLUMN "totalTokens" INTEGER;
  END IF;
END $$;
