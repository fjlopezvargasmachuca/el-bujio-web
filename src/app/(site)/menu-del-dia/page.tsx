import type { Metadata } from "next";
import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { SpecialCard } from "@/components/SpecialCard";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = { title: "Menú del día" };
export const dynamic = "force-dynamic";

const sections = ["Primeros", "Segundos", "Postres"] as const;

export default async function DailyMenuPage() {
  const [items, settings] = await Promise.all([
    prisma.specialItem.findMany({ where: { type: SpecialType.MENU_DIA, active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);
  const menuPrice = formatPrice(settings?.menuDayPriceCents ?? null);

  return (
    <div className="page">
      <div className="eyebrow">Cocina del día</div>
      <div className="menu-title-row">
        <div>
          <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Menú del día</h1>
          <p className="muted">El menú incluye 1 primero, 1 segundo y 1 postre, a elegir entre las opciones disponibles.</p>
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
              <div className="grid cards">{group.map((item) => <SpecialCard key={item.id} item={item} hidePrice />)}</div>
            </section>
          );
        })
      ) : (
        <div className="status-box warning">Todavía no se ha publicado el menú de hoy.</div>
      )}
    </div>
  );
}
