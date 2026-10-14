CREATE TABLE "SpecialSelection" (
  "id" TEXT NOT NULL,
  "specialItemId" TEXT NOT NULL,
  "menuItemId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "SpecialSelection_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SpecialSelection_specialItemId_menuItemId_key"
  ON "SpecialSelection"("specialItemId", "menuItemId");
CREATE INDEX "SpecialSelection_specialItemId_sortOrder_idx"
  ON "SpecialSelection"("specialItemId", "sortOrder");
CREATE INDEX "SpecialSelection_menuItemId_idx"
  ON "SpecialSelection"("menuItemId");

ALTER TABLE "SpecialSelection"
  ADD CONSTRAINT "SpecialSelection_specialItemId_fkey"
  FOREIGN KEY ("specialItemId") REFERENCES "SpecialItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SpecialSelection"
  ADD CONSTRAINT "SpecialSelection_menuItemId_fkey"
  FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enlaza automáticamente los elementos antiguos cuyo nombre coincide exactamente
-- con un plato de la carta. Los demás se conservan como contenido legado y pueden
-- reasignarse desde administración sin perder información.
INSERT INTO "SpecialSelection" ("id", "specialItemId", "menuItemId", "sortOrder")
SELECT 'legacy_' || md5(s."id" || ':' || m."id"), s."id", m."id", 0
FROM "SpecialItem" s
JOIN LATERAL (
  SELECT "id"
  FROM "MenuItem"
  WHERE lower(trim("name")) = lower(trim(s."name"))
  ORDER BY "sortOrder" ASC, "createdAt" ASC
  LIMIT 1
) m ON TRUE
ON CONFLICT ("specialItemId", "menuItemId") DO NOTHING;
