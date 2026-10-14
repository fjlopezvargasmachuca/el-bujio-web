ALTER TYPE "MenuCategory" ADD VALUE IF NOT EXISTS 'BEBIDAS';
ALTER TYPE "MenuCategory" ADD VALUE IF NOT EXISTS 'VINOS';
ALTER TYPE "MenuCategory" ADD VALUE IF NOT EXISTS 'CHACINA';

ALTER TABLE "MenuItem"
  ADD COLUMN IF NOT EXISTS "priceUnidadCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceCopaCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceBotellaCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "price100gCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceCuartoKgCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceKiloCents" INTEGER;

ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "catalogExpansionV11Seeded" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "LandProduct" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "priceCents" INTEGER,
  "imageData" TEXT,
  "imageMime" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LandProduct_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LandProduct_active_sortOrder_idx" ON "LandProduct"("active", "sortOrder");
