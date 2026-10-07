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

const menuDiaItems = [
  ["Potaje casero", "Primeros", ["garbanzos", "verduras", "patata", "apio", "ajo", "especias"], ["Apio"]],
  ["Sopa de tomate", "Primeros", ["tomate", "cebolla", "pan", "ajo", "aceite de oliva"], ["Gluten"]],
  ["Presa ibérica con guarnición", "Segundos", ["presa ibérica", "patata", "pimiento", "aceite de oliva"], []],
  ["Calamares fritos", "Segundos", ["calamar", "harina de trigo", "aceite", "limón"], ["Moluscos", "Gluten"]],
  ["Flan casero", "Postres", ["leche", "huevo", "azúcar", "caramelo"], ["Leche", "Huevos"]],
] as const;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@elbujio.es").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Bujio2026!";
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

  // Menú del día de ejemplo para bases nuevas.
  if ((await prisma.specialItem.count({ where: { type: SpecialType.MENU_DIA } })) === 0) {
    let specialOrder = -1;
    for (const [name, section, ingredients, allergens] of menuDiaItems) {
      specialOrder += 1;
      await prisma.specialItem.create({
        data: {
          type: SpecialType.MENU_DIA,
          name,
          section,
          ingredients: [...ingredients],
          allergens: [...allergens],
          sortOrder: specialOrder,
          active: true,
          priceCents: null,
        },
      });
    }
  }

  if ((await prisma.specialItem.count({ where: { type: SpecialType.OFERTA } })) === 0) {
    await prisma.specialItem.create({
      data: {
        type: SpecialType.OFERTA,
        name: "Oferta del día",
        description: "Promoción editable desde administración.",
        priceCents: 1200,
        ingredients: [],
        allergens: [],
        sortOrder: 0,
        active: false,
      },
    });
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
