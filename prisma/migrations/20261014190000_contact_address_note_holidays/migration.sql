ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "addressNote" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "holidayHours" TEXT NOT NULL DEFAULT 'Consultar horario en festivos';
