ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "menuDayPriceCents" INTEGER;

UPDATE "SiteSettings"
SET
  "phone" = '956 71 60 77',
  "address" = 'Venta El Bujio · Benamahoma, Cádiz',
  "contactText" = 'Llámanos para cualquier consulta sobre la carta, el menú del día, los horarios o la venta.',
  "mapsUrl" = 'https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111',
  "openingHours" = E'martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00',
  "menuDayPriceCents" = COALESCE("menuDayPriceCents", 1800)
WHERE "id" = 1;

UPDATE "SpecialItem"
SET "section" = 'Primeros'
WHERE "type" = 'MENU_DIA' AND lower(COALESCE("section", '')) IN ('primero', 'primeros');

UPDATE "SpecialItem"
SET "section" = 'Segundos'
WHERE "type" = 'MENU_DIA' AND lower(COALESCE("section", '')) IN ('segundo', 'segundos');

UPDATE "SpecialItem"
SET "section" = 'Postres'
WHERE "type" = 'MENU_DIA' AND lower(COALESCE("section", '')) IN ('postre', 'postres');

UPDATE "SpecialItem"
SET "priceCents" = NULL
WHERE "type" = 'MENU_DIA';
