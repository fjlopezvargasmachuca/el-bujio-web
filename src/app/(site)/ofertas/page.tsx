import type { Metadata } from "next";
import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { OfferCard } from "@/components/OfferCard";
import { SpecialCard } from "@/components/SpecialCard";

export const metadata: Metadata = { title: "Ofertas" };
export const dynamic = "force-dynamic";

export default async function OffersPage() {
  const rawItems = await (prisma.specialItem as any).findMany({
    where: { type: SpecialType.OFERTA, active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: ({
      selections: {
        orderBy: { sortOrder: "asc" },
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
              description: true,
              category: true,
              ingredients: true,
              allergens: true,
              imageMime: true,
              updatedAt: true,
            },
          },
        },
      },
    } as any),
  }) as any[];

  const items = rawItems.map((item) => ({
    ...item,
    dishes: (item.selections ?? []).map((selection: any) => ({
      ...selection.menuItem,
      hasImage: Boolean(selection.menuItem.imageMime),
      imageVersion: selection.menuItem.updatedAt instanceof Date
        ? selection.menuItem.updatedAt.getTime()
        : String(selection.menuItem.updatedAt ?? ""),
    })),
  }));

  return (
    <div className="page">
      <div className="eyebrow">Promociones</div>
      <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Ofertas</h1>
      <p className="muted">Las ofertas activas aparecen aquí automáticamente.</p>
      {items.length ? (
        <div className="grid cards" style={{ marginTop: 30 }}>
          {items.map((item) => item.dishes.length
            ? <OfferCard key={item.id} offer={item} />
            : <SpecialCard key={item.id} item={{ ...item, hasImage: Boolean(item.imageMime), imageVersion: item.updatedAt instanceof Date ? item.updatedAt.getTime() : String(item.updatedAt ?? "") }} />)}
        </div>
      ) : <div className="status-box">Hoy no hay ofertas publicadas. Consulta el menú del día o nuestra carta.</div>}
    </div>
  );
}
