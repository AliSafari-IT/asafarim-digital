ALTER TABLE "public"."ViontoProject"
ADD COLUMN "visualStyle" TEXT DEFAULT 'clean_modern_slideshow';

ALTER TABLE "public"."ViontoExport"
ADD COLUMN "visualStyle" TEXT;
