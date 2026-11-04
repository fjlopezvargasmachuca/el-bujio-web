import { PrismaClient } from "@prisma/client";
import { PRODUCTION_MENU_ITEMS } from "./menu-production-data";

const prisma = new PrismaClient();

const CONFIRM =
  "--confirm=EL_BUJIO_PRODUCTION";

function databaseTarget() {
  const raw = process.env.DATABASE_URL;

  if (!raw) {
    return "DATABASE_URL no definida";
  }

  try {
    const url = new URL(raw);

    return `${url.hostname}${
      url.port ? `:${url.port}` : ""
    }${url.pathname}`;
  } catch {
    return "DATABASE_URL definida";
  }
}

async function main() {
  if (!process.argv.includes(CONFIRM)) {
    console.error("");
    console.error("OPERACIÓN CANCELADA.");
    console.error(
      "Este script elimina la carta, menú del día y ofertas actuales."
    );
    console.error("");
    console.error(
      `Ejecuta conscientemente con ${CONFIRM}`
    );
    console.error("");

    process.exit(2);
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL no está definida."
    );
  }

  console.log(
    "────────────────────────────────────────────"
  );
  console.log(
    "ACTUALIZACIÓN BBDD — VENTA EL BUJIO"
  );
  console.log(
    `Base destino: ${databaseTarget()}`
  );
  console.log(
    `Nuevos elementos: ${PRODUCTION_MENU_ITEMS.length}`
  );
  console.log(
    "Se borrarán carta, menú del día y ofertas."
  );
  console.log(
    "────────────────────────────────────────────"
  );

  const result = await prisma.$transaction(
    async (tx) => {
      /*
       * Primero eliminamos menú del día y ofertas.
       * Sus SpecialSelection se eliminan por CASCADE.
       */
      const specials =
        await tx.specialItem.deleteMany({});

      /*
       * Después eliminamos completamente la carta.
       */
      const menu =
        await tx.menuItem.deleteMany({});

      /*
       * Al no existir menú del día, eliminamos
       * también el precio antiguo del menú.
       */
      await tx.siteSettings.upsert({
        where: { id: 1 },

        create: {
          id: 1,
          menuDayPriceCents: null,
          reservationEnabled: false,

          /*
           * Evita que versiones antiguas del seed
           * añadan productos de ejemplo.
           */
          catalogExpansionV11Seeded: true,
        },

        update: {
          menuDayPriceCents: null,
          catalogExpansionV11Seeded: true,
        },
      });

      /*
       * Introducimos la nueva carta.
       */
      const created =
        await tx.menuItem.createMany({
          data: PRODUCTION_MENU_ITEMS,
        });

      return {
        deletedMenu: menu.count,
        deletedSpecials: specials.count,
        created: created.count,
      };
    }
  );

  console.log("");
  console.log(
    "✓ ACTUALIZACIÓN COMPLETADA"
  );
  console.log(
    `Elementos antiguos eliminados: ${result.deletedMenu}`
  );
  console.log(
    `Menús/ofertas eliminados: ${result.deletedSpecials}`
  );
  console.log(
    `Nuevos elementos: ${result.created}`
  );
  console.log("");

  console.log(
    "Revisa ingredientes y alérgenos con cocina."
  );
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "ERROR. La actualización no se ha completado."
    );
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });