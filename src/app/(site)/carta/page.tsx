import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { DishCard } from "@/components/DishCard";
import { categoryLabel } from "@/lib/format";

export const metadata: Metadata = { title: "Carta" };
export const dynamic = "force-dynamic";

const categoryOrder = ["ENTRANTES", "PESCADO", "CARNES", "BOCADILLOS", "POSTRES", "OTROS"];

export default async function CartaPage() {
  const items = await prisma.menuItem.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  return (
    <div className="page">
      <div className="eyebrow">Nuestra selección</div>
      <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Carta</h1>

      {categoryOrder.map((category) => {
        const categoryItems = items.filter((item) => item.category === category);
        if (!categoryItems.length) return null;
        return (
          <section key={category}>
            <h2 className="category-title">{categoryLabel(category)}</h2>
            <div className="grid cards">{categoryItems.map((item) => <DishCard key={item.id} item={item} />)}</div>
          </section>
        );
      })}

      <section className="allergen-cta card">
        <div>
          <div className="eyebrow">Información alimentaria</div>
          <h2>Consulta la carta de alérgenos</h2>
          <p className="muted">Revisa en una sola tabla los alérgenos registrados para cada plato de la carta.</p>
        </div>
        <Link className="button primary" href="/carta/alergenos">Ver carta de alérgenos</Link>
      </section>
    </div>
  );
}
