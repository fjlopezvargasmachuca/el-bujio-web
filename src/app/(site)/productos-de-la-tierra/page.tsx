import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { LandProductCard } from "@/components/LandProductCard";

export const metadata: Metadata = { title: "Productos de la tierra" };
export const dynamic = "force-dynamic";

export default async function LandProductsPage() {
  const rawItems = await (prisma as any).landProduct.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, description: true, priceCents: true, imageMime: true, updatedAt: true },
  });
  const items = (rawItems as any[]).map((item: any) => ({
    ...item,
    hasImage: Boolean(item.imageMime),
    imageVersion: item.updatedAt.getTime(),
  }));

  return (
    <div className="page">
      <div className="eyebrow">Sabores para llevar</div>
      <h1 style={{ fontSize: "clamp(3rem,7vw,5.5rem)" }}>Productos de la tierra</h1>
      <p className="muted page-lead">Una pequeña selección de productos para llevarte un pedazo de la sierra a casa.</p>
      {items.length ? <div className="grid cards product-grid" style={{ marginTop: 30 }}>{items.map((item) => <LandProductCard key={item.id} item={item} />)}</div> : <div className="status-box">Todavía no hay productos publicados.</div>}
    </div>
  );
}
