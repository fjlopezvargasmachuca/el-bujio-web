-- Add new menu category for desserts.
ALTER TYPE "MenuCategory" ADD VALUE IF NOT EXISTS 'POSTRES';

-- Extend site settings with maps and opening hours.
ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "mapsUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "openingHours" TEXT NOT NULL DEFAULT 'martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00';

ALTER TABLE "SiteSettings"
  ALTER COLUMN "phone" SET DEFAULT '956 71 60 77',
  ALTER COLUMN "address" SET DEFAULT 'Venta El Bujio · Benamahoma, Cádiz',
  ALTER COLUMN "contactText" SET DEFAULT 'Estamos en Benamahoma. Consulta nuestra carta, menú del día, postres y ofertas o llámanos si necesitas cualquier información.';

UPDATE "SiteSettings"
SET
  "phone" = COALESCE(NULLIF("phone", ''), '956 71 60 77'),
  "address" = COALESCE(NULLIF("address", ''), 'Venta El Bujio · Benamahoma, Cádiz'),
  "contactText" = COALESCE(NULLIF("contactText", ''), 'Estamos en Benamahoma. Consulta nuestra carta, menú del día, postres y ofertas o llámanos si necesitas cualquier información.'),
  "mapsUrl" = COALESCE(NULLIF("mapsUrl", ''), 'https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111'),
  "openingHours" = COALESCE(NULLIF("openingHours", ''), 'martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00');
