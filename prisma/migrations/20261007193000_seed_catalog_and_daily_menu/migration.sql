-- v1.5: carga inicial de carta y menú del día para preproducción.
-- Esta migración se ejecuta una sola vez en cada base, por lo que los cambios
-- posteriores del administrador no serán sobrescritos en futuros despliegues.

-- Garantiza que exista la configuración principal incluso si la base remota
-- se creó sin ejecutar todavía el seed de desarrollo.
INSERT INTO "SiteSettings" (
  "id", "restaurantName", "phone", "address", "contactText", "mapsUrl",
  "openingHours", "menuDayPriceCents", "reservationEnabled",
  "bookingDurationMinutes", "slotMinutes", "updatedAt"
)
SELECT
  1,
  'El Bujio',
  '956 71 60 77',
  'Venta El Bujio · Benamahoma, Cádiz',
  'Llámanos para cualquier consulta sobre la carta, el menú del día, los horarios o la venta.',
  'https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111',
  E'martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00',
  1800,
  FALSE,
  90,
  30,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "SiteSettings" WHERE "id" = 1);

-- Recupera el horario si una configuración anterior quedó vacía.
UPDATE "SiteSettings"
SET "openingHours" = E'martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00'
WHERE "id" = 1 AND ("openingHours" IS NULL OR btrim("openingHours") = '');

UPDATE "SiteSettings"
SET "menuDayPriceCents" = COALESCE("menuDayPriceCents", 1800)
WHERE "id" = 1;

-- Sincroniza una única vez los platos de la carta física facilitada por la venta.
WITH data(name, category, price_cents, ingredients, allergens, sort_order) AS (
VALUES
  ('Ensalada mixta', 'ENTRANTES', 900, ARRAY['lechuga', 'tomate', 'cebolla', 'atún', 'huevo', 'aceitunas', 'aceite de oliva']::TEXT[], ARRAY['Pescado', 'Huevos']::TEXT[], 0),
  ('Pimiento con melva', 'ENTRANTES', 1000, ARRAY['pimiento asado', 'melva', 'aceite de oliva', 'sal']::TEXT[], ARRAY['Pescado']::TEXT[], 1),
  ('Caballa con tomate y cebolla', 'ENTRANTES', 900, ARRAY['caballa', 'tomate', 'cebolla', 'aceite de oliva', 'sal']::TEXT[], ARRAY['Pescado']::TEXT[], 2),
  ('Tomate con boquerón en vinagre', 'ENTRANTES', 1000, ARRAY['tomate', 'boquerón', 'vinagre', 'ajo', 'perejil', 'aceite de oliva']::TEXT[], ARRAY['Pescado', 'Sulfitos']::TEXT[], 3),
  ('Queso', 'ENTRANTES', 1200, ARRAY['queso curado']::TEXT[], ARRAY['Leche']::TEXT[], 4),
  ('Carne mechada', 'ENTRANTES', 1200, ARRAY['carne de cerdo', 'ajo', 'aceite de oliva', 'sal', 'especias']::TEXT[], ARRAY[]::TEXT[], 5),
  ('Chicharrón al corte', 'ENTRANTES', 1200, ARRAY['panceta de cerdo', 'sal', 'especias']::TEXT[], ARRAY[]::TEXT[], 6),
  ('Chicharrón frito', 'ENTRANTES', 1200, ARRAY['cerdo', 'sal', 'aceite']::TEXT[], ARRAY[]::TEXT[], 7),
  ('Lomitos de presa ibérica', 'ENTRANTES', 1400, ARRAY['presa ibérica', 'sal', 'aceite de oliva']::TEXT[], ARRAY[]::TEXT[], 8),
  ('Croqueta', 'ENTRANTES', 1000, ARRAY['leche', 'harina de trigo', 'mantequilla', 'huevo', 'pan rallado', 'relleno de la casa']::TEXT[], ARRAY['Gluten', 'Leche', 'Huevos']::TEXT[], 9),
  ('Papas bravas', 'ENTRANTES', 900, ARRAY['patata', 'tomate', 'pimentón', 'ajo', 'aceite', 'sal']::TEXT[], ARRAY[]::TEXT[], 10),
  ('Calamares fritos', 'PESCADO', 1500, ARRAY['calamar', 'harina de trigo', 'aceite', 'limón', 'sal']::TEXT[], ARRAY['Moluscos', 'Gluten']::TEXT[], 11),
  ('Gallo frito', 'PESCADO', 1400, ARRAY['gallo', 'harina de trigo', 'aceite', 'sal']::TEXT[], ARRAY['Pescado', 'Gluten']::TEXT[], 12),
  ('Langostino empanado', 'PESCADO', 1400, ARRAY['langostino', 'harina de trigo', 'huevo', 'pan rallado', 'aceite']::TEXT[], ARRAY['Crustáceos', 'Gluten', 'Huevos']::TEXT[], 13),
  ('Pulpo a la marinera', 'PESCADO', 1500, ARRAY['pulpo', 'tomate', 'cebolla', 'ajo', 'pimentón', 'aceite de oliva']::TEXT[], ARRAY['Moluscos']::TEXT[], 14),
  ('Albóndigas', 'CARNES', 1000, ARRAY['carne picada', 'huevo', 'pan rallado', 'cebolla', 'tomate', 'especias']::TEXT[], ARRAY['Huevos', 'Gluten']::TEXT[], 15),
  ('Carrillada', 'CARNES', 1400, ARRAY['carrillada de cerdo', 'cebolla', 'zanahoria', 'vino', 'aceite de oliva', 'especias']::TEXT[], ARRAY['Sulfitos']::TEXT[], 16),
  ('Lagarto ibérico', 'CARNES', 1500, ARRAY['lagarto ibérico', 'sal', 'aceite de oliva']::TEXT[], ARRAY[]::TEXT[], 17),
  ('Presa', 'CARNES', 1600, ARRAY['presa ibérica', 'sal', 'aceite de oliva']::TEXT[], ARRAY[]::TEXT[], 18),
  ('Secreto', 'CARNES', 1600, ARRAY['secreto ibérico', 'sal', 'aceite de oliva']::TEXT[], ARRAY[]::TEXT[], 19),
  ('Entrecot', 'CARNES', 2200, ARRAY['entrecot de ternera', 'sal', 'aceite de oliva']::TEXT[], ARRAY[]::TEXT[], 20),
  ('Filete de cerdo', 'BOCADILLOS', 600, ARRAY['pan', 'filete de cerdo', 'aceite', 'sal']::TEXT[], ARRAY['Gluten']::TEXT[], 21),
  ('Filete pollo empanado con alioli', 'BOCADILLOS', 600, ARRAY['pan', 'pollo', 'harina de trigo', 'huevo', 'pan rallado', 'alioli', 'aceite']::TEXT[], ARRAY['Gluten', 'Huevos']::TEXT[], 22),
  ('Lomo adobado con queso', 'BOCADILLOS', 600, ARRAY['pan', 'lomo adobado', 'queso']::TEXT[], ARRAY['Gluten', 'Leche']::TEXT[], 23),
  ('Tarta de queso', 'POSTRES', 500, ARRAY['queso crema', 'nata', 'huevo', 'azúcar', 'galleta']::TEXT[], ARRAY['Leche', 'Huevos', 'Gluten']::TEXT[], 24),
  ('Flan casero', 'POSTRES', 450, ARRAY['leche', 'huevo', 'azúcar', 'caramelo']::TEXT[], ARRAY['Leche', 'Huevos']::TEXT[], 25),
  ('Arroz con leche', 'POSTRES', 450, ARRAY['leche', 'arroz', 'azúcar', 'canela']::TEXT[], ARRAY['Leche']::TEXT[], 26)
), updated AS (
  UPDATE "MenuItem" AS item
  SET
    "category" = data.category::"MenuCategory",
    "priceTapaCents" = NULL,
    "priceMediaCents" = NULL,
    "pricePlatoCents" = data.price_cents,
    "ingredients" = data.ingredients,
    "allergens" = data.allergens,
    "active" = TRUE,
    "sortOrder" = data.sort_order,
    "updatedAt" = CURRENT_TIMESTAMP
  FROM data
  WHERE item."name" = data.name
  RETURNING item."name"
)
INSERT INTO "MenuItem" (
  "id", "name", "description", "category", "ingredients", "allergens",
  "priceTapaCents", "priceMediaCents", "pricePlatoCents", "active",
  "sortOrder", "createdAt", "updatedAt"
)
SELECT
  'seed-v15-menu-' || substr(md5(data.name), 1, 16),
  data.name,
  NULL,
  data.category::"MenuCategory",
  data.ingredients,
  data.allergens,
  NULL,
  NULL,
  data.price_cents,
  TRUE,
  data.sort_order,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM data
WHERE NOT EXISTS (
  SELECT 1 FROM "MenuItem" item WHERE item."name" = data.name
);

-- Menú del día de ejemplo: 1 primero + 1 segundo + 1 postre a elegir.
WITH data(name, section, ingredients, allergens, sort_order) AS (
VALUES
  ('Potaje casero', 'Primeros', ARRAY['garbanzos', 'verduras', 'patata', 'apio', 'ajo', 'especias']::TEXT[], ARRAY['Apio']::TEXT[], 0),
  ('Sopa de tomate', 'Primeros', ARRAY['tomate', 'cebolla', 'pan', 'ajo', 'aceite de oliva']::TEXT[], ARRAY['Gluten']::TEXT[], 1),
  ('Presa ibérica con guarnición', 'Segundos', ARRAY['presa ibérica', 'patata', 'pimiento', 'aceite de oliva']::TEXT[], ARRAY[]::TEXT[], 2),
  ('Calamares fritos', 'Segundos', ARRAY['calamar', 'harina de trigo', 'aceite', 'limón']::TEXT[], ARRAY['Moluscos', 'Gluten']::TEXT[], 3),
  ('Flan casero', 'Postres', ARRAY['leche', 'huevo', 'azúcar', 'caramelo']::TEXT[], ARRAY['Leche', 'Huevos']::TEXT[], 4)
), updated AS (
  UPDATE "SpecialItem" AS item
  SET
    "section" = data.section,
    "ingredients" = data.ingredients,
    "allergens" = data.allergens,
    "active" = TRUE,
    "sortOrder" = data.sort_order,
    "priceCents" = NULL,
    "updatedAt" = CURRENT_TIMESTAMP
  FROM data
  WHERE item."type" = 'MENU_DIA'::"SpecialType" AND item."name" = data.name
  RETURNING item."name"
)
INSERT INTO "SpecialItem" (
  "id", "type", "name", "description", "section", "priceCents",
  "ingredients", "allergens", "active", "sortOrder", "createdAt", "updatedAt"
)
SELECT
  'seed-v15-special-' || substr(md5(data.section || '-' || data.name), 1, 16),
  'MENU_DIA'::"SpecialType",
  data.name,
  'Ejemplo editable desde administración.',
  data.section,
  NULL,
  data.ingredients,
  data.allergens,
  TRUE,
  data.sort_order,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM data
WHERE NOT EXISTS (
  SELECT 1 FROM "SpecialItem" item
  WHERE item."type" = 'MENU_DIA'::"SpecialType" AND item."name" = data.name
);
