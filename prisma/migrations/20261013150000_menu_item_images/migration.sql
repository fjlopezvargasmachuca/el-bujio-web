-- v1.7: imagen opcional por plato.
-- Se guarda en PostgreSQL para no depender de almacenamiento de archivos externo.
ALTER TABLE "MenuItem"
  ADD COLUMN IF NOT EXISTS "imageData" TEXT,
  ADD COLUMN IF NOT EXISTS "imageMime" TEXT;
