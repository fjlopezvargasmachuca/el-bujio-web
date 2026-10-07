import { PrismaClient, Area, MenuCategory, SpecialType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const items = [
  ["Ensalada mixta", MenuCategory.ENTRANTES, null, null, 900, ["lechuga", "tomate", "cebolla", "atún", "huevo"], ["Pescado", "Huevos"]],
  ["Pimiento con melva", MenuCategory.ENTRANTES, null, null, 1000, ["pimiento asado", "melva", "aceite de oliva"], ["Pescado"]],
  ["Caballa con tomate y cebolla", MenuCategory.ENTRANTES, null, null, 900, ["caballa", "tomate", "cebolla", "aceite de oliva"], ["Pescado"]],
  ["Tomate con boquerón en vinagre", MenuCategory.ENTRANTES, null, null, 1000, ["tomate", "boquerón", "vinagre", "ajo", "perejil"], ["Pescado", "Sulfitos"]],
  ["Queso", MenuCategory.ENTRANTES, null, null, 1200, ["queso curado"], ["Leche"]],
  ["Carne mechada", MenuCategory.ENTRANTES, null, null, 1200, ["carne de cerdo", "ajo", "especias"], []],
  ["Chicharrón al corte", MenuCategory.ENTRANTES, null, null, 1200, ["panceta de cerdo", "sal", "especias"], []],
  ["Chicharrón frito", MenuCategory.ENTRANTES, null, null, 1200, ["cerdo", "sal", "aceite"], []],
  ["Lomitos de presa ibérica", MenuCategory.ENTRANTES, null, null, 1400, ["presa ibérica", "sal", "aceite de oliva"], []],
  ["Croqueta", MenuCategory.ENTRANTES, 180, 520, 1000, ["leche", "harina", "mantequilla", "huevo", "pan rallado"], ["Gluten", "Leche", "Huevos"]],
  ["Papas bravas", MenuCategory.ENTRANTES, 350, 650, 900, ["patata", "tomate", "pimentón", "ajo", "aceite"], []],
  ["Calamares fritos", MenuCategory.PESCADO, 850, 1100, 1500, ["calamar", "harina", "aceite", "limón"], ["Moluscos", "Gluten"]],
  ["Gallo frito", MenuCategory.PESCADO, null, null, 1400, ["gallo", "harina", "aceite"], ["Pescado", "Gluten"]],
  ["Langostino empanado", MenuCategory.PESCADO, null, null, 1400, ["langostino", "harina", "huevo", "pan rallado"], ["Crustáceos", "Gluten", "Huevos"]],
  ["Pulpo a la marinera", MenuCategory.PESCADO, null, null, 1500, ["pulpo", "tomate", "cebolla", "ajo", "pimentón"], ["Moluscos"]],
  ["Albóndigas", MenuCategory.CARNES, 500, 750, 1000, ["carne picada", "huevo", "pan rallado", "cebolla", "tomate"], ["Huevos", "Gluten"]],
  ["Carrillada", MenuCategory.CARNES, null, 950, 1400, ["carrillada de cerdo", "cebolla", "zanahoria", "vino", "especias"], ["Sulfitos"]],
  ["Lagarto ibérico", MenuCategory.CARNES, null, 1050, 1500, ["lagarto ibérico", "sal", "aceite de oliva"], []],
  ["Presa", MenuCategory.CARNES, null, 1150, 1600, ["presa ibérica", "sal", "aceite de oliva"], []],
  ["Secreto", MenuCategory.CARNES, null, 1150, 1600, ["secreto ibérico", "sal", "aceite de oliva"], []],
  ["Entrecot", MenuCategory.CARNES, null, 1550, 2200, ["entrecot de ternera", "sal", "aceite de oliva"], []],
  ["Filete de cerdo", MenuCategory.BOCADILLOS, null, null, 600, ["pan", "filete de cerdo", "aceite"], ["Gluten"]],
  ["Filete pollo empanado con alioli", MenuCategory.BOCADILLOS, null, null, 600, ["pan", "pollo", "harina", "huevo", "pan rallado", "alioli"], ["Gluten", "Huevos"]],
  ["Lomo adobado con queso", MenuCategory.BOCADILLOS, null, null, 600, ["pan", "lomo adobado", "queso"], ["Gluten", "Leche"]],
  ["Tarta de queso", MenuCategory.POSTRES, null, null, 500, ["queso crema", "nata", "huevo", "galleta"], ["Leche", "Huevos", "Gluten"]],
  ["Flan casero", MenuCategory.POSTRES, null, null, 450, ["leche", "huevo", "azúcar", "caramelo"], ["Leche", "Huevos"]],
  ["Arroz con leche", MenuCategory.POSTRES, null, null, 450, ["leche", "arroz", "azúcar", "canela"], ["Leche"]],
] as const;

const menuDiaItems = [
  ["Potaje casero", "Primeros", ["legumbres", "verduras", "especias"], ["Apio"]],
  ["Sopa de tomate", "Primeros", ["tomate", "cebolla", "pan", "aceite de oliva"], ["Gluten"]],
  ["Presa ibérica con guarnición", "Segundos", ["presa ibérica", "patata", "pimiento"], []],
  ["Calamares fritos", "Segundos", ["calamar", "harina", "aceite", "limón"], ["Moluscos", "Gluten"]],
  ["Flan casero", "Postres", ["leche", "huevo", "azúcar", "caramelo"], ["Leche", "Huevos"]],
] as const;

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@elbujio.es").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Bujio2026!";
  if (password.length < 10) throw new Error("ADMIN_PASSWORD debe tener al menos 10 caracteres.");

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 12) },
    create: { email, passwordHash: await bcrypt.hash(password, 12) },
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

  {
    const tables = [
      ["Exterior 1", Area.EXTERIOR, 4], ["Exterior 2", Area.EXTERIOR, 4],
      ["Exterior 3", Area.EXTERIOR, 6], ["Exterior 4", Area.EXTERIOR, 8],
      ["Interior 1", Area.INTERIOR, 4], ["Interior 2", Area.INTERIOR, 6], ["Interior 3", Area.INTERIOR, 8],
    ] as const;

    for (const [name, area, capacity] of tables) {
      await prisma.diningTable.upsert({ where: { name }, update: { area, capacity, active: true }, create: { name, area, capacity } });
    }

    if ((await prisma.menuItem.count()) === 0) {
      let menuOrder = -1;
      for (const [name, category, priceTapaCents, priceMediaCents, pricePlatoCents, ingredients, allergens] of items) {
        menuOrder += 1;
        await prisma.menuItem.create({
          data: { name, category, priceTapaCents, priceMediaCents, pricePlatoCents, ingredients: [...ingredients], allergens: [...allergens], sortOrder: menuOrder },
        });
      }
    }

    if ((await prisma.specialItem.count({ where: { type: SpecialType.MENU_DIA } })) === 0) {
      let specialOrder = -1;
      for (const [name, section, ingredients, allergens] of menuDiaItems) {
        specialOrder += 1;
        await prisma.specialItem.create({
          data: { type: SpecialType.MENU_DIA, name, section, ingredients: [...ingredients], allergens: [...allergens], sortOrder: specialOrder, active: true, priceCents: null },
        });
      }
    }

    if ((await prisma.specialItem.count({ where: { type: SpecialType.OFERTA } })) === 0) {
      await prisma.specialItem.create({
        data: { type: SpecialType.OFERTA, name: "Oferta del día", description: "Promoción editable desde administración.", priceCents: 1200, ingredients: [], allergens: [], sortOrder: 0, active: false },
      });
    }
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
