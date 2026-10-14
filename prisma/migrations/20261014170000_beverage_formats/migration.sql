ALTER TABLE "MenuItem"
  ADD COLUMN IF NOT EXISTS "priceCanaCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceCortadaCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceTercioCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceBotellaPequenaCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "priceBotellaGrandeCents" INTEGER;

-- Conserva el precio ya existente, asignándolo al formato que describía
-- el ejemplo anterior, sin inventar importes para los nuevos formatos.
UPDATE "MenuItem"
SET "priceBotellaPequenaCents" = COALESCE("priceBotellaPequenaCents", "priceUnidadCents"),
    "priceUnidadCents" = NULL
WHERE "category" = 'BEBIDAS' AND lower("name") = 'agua mineral';

UPDATE "MenuItem"
SET "priceTercioCents" = COALESCE("priceTercioCents", "priceUnidadCents"),
    "priceUnidadCents" = NULL
WHERE "category" = 'BEBIDAS' AND lower("name") = 'cerveza';
