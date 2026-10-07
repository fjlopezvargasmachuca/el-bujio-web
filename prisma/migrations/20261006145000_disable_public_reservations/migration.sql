-- The reservation data model is intentionally preserved for a future phase,
-- but the current product does not expose reservation functionality.
ALTER TABLE "SiteSettings"
  ALTER COLUMN "reservationEnabled" SET DEFAULT false,
  ALTER COLUMN "contactText" SET DEFAULT 'Llámanos para cualquier consulta sobre la carta, horarios o el restaurante.';

UPDATE "SiteSettings"
SET "reservationEnabled" = false;

UPDATE "SiteSettings"
SET "contactText" = 'Llámanos para cualquier consulta sobre la carta, horarios o el restaurante.'
WHERE "contactText" = 'Reserva tu mesa o llámanos para cualquier consulta.';
