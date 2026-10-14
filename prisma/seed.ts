import { PrismaClient, Area, MenuCategory, SpecialType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Carta inicial basada en la fotografía facilitada por Venta El Bujio.
 * La carta física muestra un único precio por producto, por eso se carga
 * como precio de plato/ración y tapa/media quedan vacíos hasta que la venta
 * decida utilizarlos.
 */
const items = [
  ["Ensalada mixta", MenuCategory.ENTRANTES, 900, ["lechuga", "tomate", "cebolla", "atún", "huevo", "aceitunas", "aceite de oliva"], ["Pescado", "Huevos"]],
  ["Pimiento con melva", MenuCategory.ENTRANTES, 1000, ["pimiento asado", "melva", "aceite de oliva", "sal"], ["Pescado"]],
  ["Caballa con tomate y cebolla", MenuCategory.ENTRANTES, 900, ["caballa", "tomate", "cebolla", "aceite de oliva", "sal"], ["Pescado"]],
  ["Tomate con boquerón en vinagre", MenuCategory.ENTRANTES, 1000, ["tomate", "boquerón", "vinagre", "ajo", "perejil", "aceite de oliva"], ["Pescado", "Sulfitos"]],
  ["Queso", MenuCategory.ENTRANTES, 1200, ["queso curado"], ["Leche"]],
  ["Carne mechada", MenuCategory.ENTRANTES, 1200, ["carne de cerdo", "ajo", "aceite de oliva", "sal", "especias"], []],
  ["Chicharrón al corte", MenuCategory.ENTRANTES, 1200, ["panceta de cerdo", "sal", "especias"], []],
  ["Chicharrón frito", MenuCategory.ENTRANTES, 1200, ["cerdo", "sal", "aceite"], []],
  ["Lomitos de presa ibérica", MenuCategory.ENTRANTES, 1400, ["presa ibérica", "sal", "aceite de oliva"], []],
  ["Croqueta", MenuCategory.ENTRANTES, 1000, ["leche", "harina de trigo", "mantequilla", "huevo", "pan rallado", "relleno de la casa"], ["Gluten", "Leche", "Huevos"]],
  ["Papas bravas", MenuCategory.ENTRANTES, 900, ["patata", "tomate", "pimentón", "ajo", "aceite", "sal"], []],

  ["Calamares fritos", MenuCategory.PESCADO, 1500, ["calamar", "harina de trigo", "aceite", "limón", "sal"], ["Moluscos", "Gluten"]],
  ["Gallo frito", MenuCategory.PESCADO, 1400, ["gallo", "harina de trigo", "aceite", "sal"], ["Pescado", "Gluten"]],
  ["Langostino empanado", MenuCategory.PESCADO, 1400, ["langostino", "harina de trigo", "huevo", "pan rallado", "aceite"], ["Crustáceos", "Gluten", "Huevos"]],
  ["Pulpo a la marinera", MenuCategory.PESCADO, 1500, ["pulpo", "tomate", "cebolla", "ajo", "pimentón", "aceite de oliva"], ["Moluscos"]],

  ["Albóndigas", MenuCategory.CARNES, 1000, ["carne picada", "huevo", "pan rallado", "cebolla", "tomate", "especias"], ["Huevos", "Gluten"]],
  ["Carrillada", MenuCategory.CARNES, 1400, ["carrillada de cerdo", "cebolla", "zanahoria", "vino", "aceite de oliva", "especias"], ["Sulfitos"]],
  ["Lagarto ibérico", MenuCategory.CARNES, 1500, ["lagarto ibérico", "sal", "aceite de oliva"], []],
  ["Presa", MenuCategory.CARNES, 1600, ["presa ibérica", "sal", "aceite de oliva"], []],
  ["Secreto", MenuCategory.CARNES, 1600, ["secreto ibérico", "sal", "aceite de oliva"], []],
  ["Entrecot", MenuCategory.CARNES, 2200, ["entrecot de ternera", "sal", "aceite de oliva"], []],

  ["Filete de cerdo", MenuCategory.BOCADILLOS, 600, ["pan", "filete de cerdo", "aceite", "sal"], ["Gluten"]],
  ["Filete pollo empanado con alioli", MenuCategory.BOCADILLOS, 600, ["pan", "pollo", "harina de trigo", "huevo", "pan rallado", "alioli", "aceite"], ["Gluten", "Huevos"]],
  ["Lomo adobado con queso", MenuCategory.BOCADILLOS, 600, ["pan", "lomo adobado", "queso"], ["Gluten", "Leche"]],

  ["Tarta de queso", MenuCategory.POSTRES, 500, ["queso crema", "nata", "huevo", "azúcar", "galleta"], ["Leche", "Huevos", "Gluten"]],
  ["Flan casero", MenuCategory.POSTRES, 450, ["leche", "huevo", "azúcar", "caramelo"], ["Leche", "Huevos"]],
  ["Arroz con leche", MenuCategory.POSTRES, 450, ["leche", "arroz", "azúcar", "canela"], ["Leche"]],
] as const;


const catalogExpansionItems = [
  {
    name: "Agua mineral",
    category: "BEBIDAS" as MenuCategory,
    description: "Botella individual.",
    ingredients: ["agua mineral"],
    allergens: [],
    priceBotellaPequenaCents: 150,
  },
  {
    name: "Refresco",
    category: "BEBIDAS" as MenuCategory,
    description: "Refresco individual. Consulta variedades disponibles.",
    ingredients: [],
    allergens: [],
    priceUnidadCents: 220,
  },
  {
    name: "Cerveza",
    category: "BEBIDAS" as MenuCategory,
    description: "Botella o lata individual según disponibilidad.",
    ingredients: ["agua", "malta de cebada", "lúpulo"],
    allergens: ["Gluten"],
    priceTercioCents: 220,
  },
  {
    name: "Vino blanco de la casa",
    category: "VINOS" as MenuCategory,
    description: "Vino blanco de la casa.",
    ingredients: ["vino"],
    allergens: ["Sulfitos"],
    priceCopaCents: 250,
    priceBotellaCents: 1200,
  },
  {
    name: "Vino tinto de la Sierra",
    category: "VINOS" as MenuCategory,
    description: "Selección de vino tinto de la zona.",
    ingredients: ["vino"],
    allergens: ["Sulfitos"],
    priceCopaCents: 300,
    priceBotellaCents: 1600,
  },
  {
    name: "Jamón ibérico",
    category: "CHACINA" as MenuCategory,
    description: "Corte de chacina ibérica.",
    ingredients: ["jamón de cerdo ibérico", "sal"],
    allergens: [],
    price100gCents: 1400,
    priceCuartoKgCents: 3200,
    priceKiloCents: 12000,
  },
  {
    name: "Chorizo ibérico",
    category: "CHACINA" as MenuCategory,
    description: "Chorizo ibérico curado.",
    ingredients: ["carne de cerdo", "pimentón", "sal", "especias"],
    allergens: [],
    priceUnidadCents: 500,
    price100gCents: 600,
    priceCuartoKgCents: 1400,
    priceKiloCents: 5200,
  },
] as const;

const landProductExamples = [
  ["Miel de la Sierra", "Miel de la Sierra de Grazalema. Ejemplo editable desde administración.", 850],
  ["Sal de Cádiz", "Sal envasada para llevar. Ejemplo editable desde administración.", 350],
  ["Aceite de oliva virgen extra", "Producto de la tierra en formato para venta. Ejemplo editable desde administración.", 1200],
] as const;

const menuDiaItems = [
  ["Potaje casero", "Primeros", ["garbanzos", "verduras", "patata", "apio", "ajo", "especias"], ["Apio"]],
  ["Sopa de tomate", "Primeros", ["tomate", "cebolla", "pan", "ajo", "aceite de oliva"], ["Gluten"]],
  ["Presa ibérica con guarnición", "Segundos", ["presa ibérica", "patata", "pimiento", "aceite de oliva"], []],
  ["Calamares fritos", "Segundos", ["calamar", "harina de trigo", "aceite", "limón"], ["Moluscos", "Gluten"]],
  ["Flan casero", "Postres", ["leche", "huevo", "azúcar", "caramelo"], ["Leche", "Huevos"]],
] as const;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@elbujio.es").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) throw new Error("ADMIN_PASSWORD es obligatorio.");
  if (password.length < 10) throw new Error("ADMIN_PASSWORD debe tener al menos 10 caracteres.");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { reservationEnabled: false },
    create: {
      id: 1,
      restaurantName: "El Bujio",
      phone: "956 71 60 77",
      address: "Venta El Bujio · Benamahoma, Cádiz",
      contactText: "Llámanos para cualquier consulta sobre la carta, el menú del día, los horarios o la venta.",
      mapsUrl: "https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111",
      openingHours: "martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00",
      menuDayPriceCents: 1800,
      reservationEnabled: false,
    },
  });

  const tables = [
    ["Exterior 1", Area.EXTERIOR, 4], ["Exterior 2", Area.EXTERIOR, 4],
    ["Exterior 3", Area.EXTERIOR, 6], ["Exterior 4", Area.EXTERIOR, 8],
    ["Interior 1", Area.INTERIOR, 4], ["Interior 2", Area.INTERIOR, 6], ["Interior 3", Area.INTERIOR, 8],
  ] as const;

  for (const [name, area, capacity] of tables) {
    await prisma.diningTable.upsert({
      where: { name },
      update: { area, capacity, active: true },
      create: { name, area, capacity },
    });
  }

  // Solo carga la carta inicial en una base vacía. Una vez el administrador
  // empieza a editar, los siguientes seeds no pisan sus cambios.
  if ((await prisma.menuItem.count()) === 0) {
    let menuOrder = -1;
    for (const [name, category, pricePlatoCents, ingredients, allergens] of items) {
      menuOrder += 1;
      await prisma.menuItem.create({
        data: {
          name,
          category,
          priceTapaCents: null,
          priceMediaCents: null,
          pricePlatoCents,
          ingredients: [...ingredients],
          allergens: [...allergens],
          sortOrder: menuOrder,
        },
      });
    }
  }

  // Menú del día de ejemplo para bases nuevas. Desde v1.16 reutiliza
  // platos de la carta para evitar duplicar nombre, imagen, ingredientes y alérgenos.
  if ((await prisma.specialItem.count({ where: { type: SpecialType.MENU_DIA } })) === 0) {
    const menuLinks = [
      ["Ensalada mixta", "Primeros"],
      ["Croqueta", "Primeros"],
      ["Carrillada", "Segundos"],
      ["Calamares fritos", "Segundos"],
      ["Flan casero", "Postres"],
      ["Tarta de queso", "Postres"],
    ] as const;
    let specialOrder = -1;
    for (const [dishName, section] of menuLinks) {
      const dish = await prisma.menuItem.findFirst({ where: { name: dishName }, orderBy: { sortOrder: "asc" } });
      if (!dish) continue;
      specialOrder += 1;
      await prisma.specialItem.create({
        data: ({
          type: SpecialType.MENU_DIA,
          name: dish.name,
          section,
          ingredients: [],
          allergens: [],
          sortOrder: specialOrder,
          active: true,
          priceCents: null,
          selections: { create: { menuItemId: dish.id, sortOrder: 0 } },
        }) as any,
      });
    }
  }

  if ((await prisma.specialItem.count({ where: { type: SpecialType.OFERTA } })) === 0) {
    const offerDishes = await prisma.menuItem.findMany({
      where: { name: { in: ["Croqueta", "Papas bravas"] } },
      orderBy: { sortOrder: "asc" },
      take: 2,
    });
    await prisma.specialItem.create({
      data: ({
        type: SpecialType.OFERTA,
        name: "Oferta del día",
        description: "Promoción editable desde administración.",
        priceCents: 1200,
        ingredients: [],
        allergens: [],
        sortOrder: 0,
        active: false,
        selections: offerDishes.length ? {
          create: offerDishes.map((dish, index) => ({ menuItemId: dish.id, sortOrder: index })),
        } : undefined,
      }) as any,
    });
  }

  // Ampliación v1.11: se ejecuta una sola vez por base de datos para no
  // recrear productos que el administrador elimine posteriormente.
  const expansionSettings = await prisma.siteSettings.findUnique({ where: { id: 1 } }) as any;
  if (!expansionSettings?.catalogExpansionV11Seeded) {
    let nextOrder = ((await prisma.menuItem.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? -1) + 1;
    for (const item of catalogExpansionItems) {
      const exists = await prisma.menuItem.findFirst({ where: { name: item.name, category: item.category } });
      if (exists) continue;
      await prisma.menuItem.create({
        data: ({
          name: item.name,
          category: item.category,
          description: item.description,
          ingredients: [...item.ingredients],
          allergens: [...item.allergens],
          priceUnidadCents: "priceUnidadCents" in item ? item.priceUnidadCents : null,
          priceCanaCents: "priceCanaCents" in item ? item.priceCanaCents : null,
          priceCortadaCents: "priceCortadaCents" in item ? item.priceCortadaCents : null,
          priceTercioCents: "priceTercioCents" in item ? item.priceTercioCents : null,
          priceBotellaPequenaCents: "priceBotellaPequenaCents" in item ? item.priceBotellaPequenaCents : null,
          priceBotellaGrandeCents: "priceBotellaGrandeCents" in item ? item.priceBotellaGrandeCents : null,
          priceCopaCents: "priceCopaCents" in item ? item.priceCopaCents : null,
          priceBotellaCents: "priceBotellaCents" in item ? item.priceBotellaCents : null,
          price100gCents: "price100gCents" in item ? item.price100gCents : null,
          priceCuartoKgCents: "priceCuartoKgCents" in item ? item.priceCuartoKgCents : null,
          priceKiloCents: "priceKiloCents" in item ? item.priceKiloCents : null,
          sortOrder: nextOrder++,
          active: true,
        } as any),
      });
    }

    if ((await (prisma as any).landProduct.count()) === 0) {
      let productOrder = 0;
      for (const [name, description, priceCents] of landProductExamples) {
        await (prisma as any).landProduct.create({ data: { name, description, priceCents, sortOrder: productOrder++, active: true } });
      }
    }

    await prisma.siteSettings.update({ where: { id: 1 }, data: ({ catalogExpansionV11Seeded: true } as any) });
  }

  console.log("Base de datos preparada.");
  console.log(`Administrador: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
