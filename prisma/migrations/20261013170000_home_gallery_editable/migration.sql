ALTER TABLE "SiteSettings"
  ADD COLUMN IF NOT EXISTS "homeImage1Data" TEXT,
  ADD COLUMN IF NOT EXISTS "homeImage1Mime" TEXT,
  ADD COLUMN IF NOT EXISTS "homeImage1Title" TEXT NOT NULL DEFAULT 'La venta y su terraza',
  ADD COLUMN IF NOT EXISTS "homeImage1Description" TEXT NOT NULL DEFAULT 'Un rincón tradicional a la entrada de Benamahoma.',
  ADD COLUMN IF NOT EXISTS "homeImage1CreditText" TEXT DEFAULT 'Foto: Turismo de Grazalema',
  ADD COLUMN IF NOT EXISTS "homeImage1CreditUrl" TEXT DEFAULT 'https://turismo.grazalema.es/index.php/la-guia/comer/336-101-venta-el-bujio',
  ADD COLUMN IF NOT EXISTS "homeImage2Data" TEXT,
  ADD COLUMN IF NOT EXISTS "homeImage2Mime" TEXT,
  ADD COLUMN IF NOT EXISTS "homeImage2Title" TEXT NOT NULL DEFAULT 'Benamahoma y su entorno',
  ADD COLUMN IF NOT EXISTS "homeImage2Description" TEXT NOT NULL DEFAULT 'Naturaleza, pueblo blanco y Sierra de Grazalema.',
  ADD COLUMN IF NOT EXISTS "homeImage2CreditText" TEXT DEFAULT 'Foto: Vincent van Zeijst · CC BY-SA 4.0',
  ADD COLUMN IF NOT EXISTS "homeImage2CreditUrl" TEXT DEFAULT 'https://commons.wikimedia.org/wiki/File:.Spain,_Andalusia,_Benamahoma_(03).jpg';
