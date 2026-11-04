import {
  PrismaClient,
  Area,
} from "@prisma/client";

import bcrypt from "bcryptjs";

import {
  PRODUCTION_MENU_ITEMS,
} from "./menu-production-data";

const prisma = new PrismaClient();

async function main() {
  const email = (
    process.env.ADMIN_EMAIL ??
    "admin@elbujio.es"
  )
    .trim()
    .toLowerCase();

  const password =
    process.env.ADMIN_PASSWORD?.trim();

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD es obligatorio."
    );
  }

  if (password.length < 10) {
    throw new Error(
      "ADMIN_PASSWORD debe tener al menos 10 caracteres."
    );
  }

  const passwordHash =
    await bcrypt.hash(password, 12);

  /*
   * Administrador.
   */
  await prisma.adminUser.upsert({
    where: {
      email,
    },

    update: {
      passwordHash,
    },

    create: {
      email,
      passwordHash,
    },
  });

  /*
   * Configuración general.
   */
  await prisma.siteSettings.upsert({
    where: {
      id: 1,
    },

    update: {
      reservationEnabled: false,

      /*
       * Deshabilita las antiguas cargas
       * automáticas de productos de ejemplo.
       */
      catalogExpansionV11Seeded: true,
    },

    create: {
      id: 1,

      restaurantName:
        "El Bujio",

      phone:
        "956 71 60 77",

      address:
        "Venta El Bujio · Benamahoma, Cádiz",

      contactText:
        "Llámanos para cualquier consulta sobre la carta, el menú del día, los horarios o la venta.",

      mapsUrl:
        "https://www.google.com/maps/place//data=!4m2!3m1!1s0xd0d1472e8bb1e95:0x153d77a80ef824a8?sa=X&ved=1t:8290&ictx=111",

      openingHours:
        "martes|Cerrado\n" +
        "miércoles|11:00-23:00\n" +
        "jueves|11:00-23:00\n" +
        "viernes|11:00-23:00\n" +
        "sábado|11:00-23:00\n" +
        "domingo|11:00-17:00\n" +
        "lunes|11:00-23:00",

      menuDayPriceCents: null,

      reservationEnabled: false,

      catalogExpansionV11Seeded: true,
    },
  });

  /*
   * Estructura que seguimos conservando para
   * el futuro sistema de reservas.
   */
  const tables = [
    [
      "Exterior 1",
      Area.EXTERIOR,
      4,
    ],

    [
      "Exterior 2",
      Area.EXTERIOR,
      4,
    ],

    [
      "Exterior 3",
      Area.EXTERIOR,
      6,
    ],

    [
      "Exterior 4",
      Area.EXTERIOR,
      8,
    ],

    [
      "Interior 1",
      Area.INTERIOR,
      4,
    ],

    [
      "Interior 2",
      Area.INTERIOR,
      6,
    ],

    [
      "Interior 3",
      Area.INTERIOR,
      8,
    ],
  ] as const;

  for (
    const [
      name,
      area,
      capacity,
    ] of tables
  ) {
    await prisma.diningTable.upsert({
      where: {
        name,
      },

      update: {
        area,
        capacity,
        active: true,
      },

      create: {
        name,
        area,
        capacity,
      },
    });
  }

  /*
   * Solo carga la carta automáticamente cuando
   * la base de datos es completamente nueva.
   *
   * Si el administrador modifica o elimina
   * elementos posteriormente, el siguiente
   * despliegue NO vuelve a crearlos.
   */
  const menuCount =
    await prisma.menuItem.count();

  if (menuCount === 0) {
    await prisma.menuItem.createMany({
      data:
        PRODUCTION_MENU_ITEMS,
    });

    console.log(
      `Carta inicial cargada: ${PRODUCTION_MENU_ITEMS.length} elementos.`
    );
  }

  /*
   * DELIBERADAMENTE NO CREAMOS:
   *
   * - MENU_DIA
   * - OFERTA
   *
   * Esos contenidos se gestionan exclusivamente
   * desde el panel de administración.
   */

  console.log(
    "Base de datos preparada."
  );

  console.log(
    `Administrador: ${email}`
  );
}

main()
  .catch((error) => {
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });