import type { Metadata } from "next";
import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DishCard } from "@/components/DishCard";
import { SpecialCard } from "@/components/SpecialCard";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Menú del día" };
export const dynamic = "force-dynamic";

const sections = ["Primeros", "Segundos", "Postres"] as const;

const dishSelect = {
  id: true,
  name: true,
  description: true,
  category: true,
  ingredients: true,
  allergens: true,
  priceTapaCents: true,
  priceMediaCents: true,
  pricePlatoCents: true,
  priceUnidadCents: true,
  priceCanaCents: true,
  priceCortadaCents: true,
  priceTercioCents: true,
  priceBotellaPequenaCents: true,
  priceBotellaGrandeCents: true,
  priceCopaCents: true,
  priceBotellaCents: true,
  price100gCents: true,
  priceCuartoKgCents: true,
  priceKiloCents: true,
  imageMime: true,
  updatedAt: true,
} as const;

export default async function DailyMenuPage() {
  const [rawItems, settings] = await Promise.all([
    (prisma.specialItem as any).findMany({
      where: { type: SpecialType.MENU_DIA, active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: ({
        selections: {
          orderBy: { sortOrder: "asc" },
          include: { menuItem: { select: dishSelect } },
        },
      } as any),
    }) as any,
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { menuDayPriceCents: true } }),
  ]);

  const items = (rawItems as any[]).map((item) => ({
    ...item,
    linkedDish: item.selections?.[0]?.menuItem
      ? {
          ...item.selections[0].menuItem,
          hasImage: Boolean(item.selections[0].menuItem.imageMime),
          imageVersion: item.selections[0].menuItem.updatedAt instanceof Date
            ? item.selections[0].menuItem.updatedAt.getTime()
            : String(item.selections[0].menuItem.updatedAt ?? ""),
        }
      : null,
  }));

  const menuPrice = formatPrice(settings?.menuDayPriceCents ?? null);

  return (
    <div className="page">
      <div className="eyebrow">Cocina del día</div>
      <div className="menu-title-row">
        <div>
          <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Menú del día</h1>
          <p className="muted">El menú incluye un primero, un segundo y un postre, a elegir entre las opciones disponibles.</p>
        </div>
        <div className="menu-price-card">
          <span>Precio del menú</span>
          <strong>{menuPrice ?? "Consultar"}</strong>
        </div>
      </div>

      {items.length ? (
        sections.map((section) => {
          const group = items.filter((item) => (item.section ?? "").toLowerCase() === section.toLowerCase());
          if (!group.length) return null;
          return (
            <section key={section} style={{ marginTop: 30 }}>
              <h2 className="category-title">{section}</h2>
              <div className="grid cards">
                {group.map((item) => item.linkedDish
                  ? <DishCard key={item.id} item={item.linkedDish} hidePrices />
                  : <SpecialCard key={item.id} item={{ ...item, hasImage: Boolean(item.imageMime), imageVersion: item.updatedAt instanceof Date ? item.updatedAt.getTime() : String(item.updatedAt ?? "") }} hidePrice />)}
              </div>
            </section>
          );
        })
      ) : (
        <div className="status-box warning">Todavía no se ha publicado el menú de hoy.</div>
      )}

      <p className="muted menu-day-note">* Servicio pan/picos y bebidas no incluidas</p>
    </div>
  );
}
