import { MenuCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { categoryLabel } from "@/lib/format";
import { createMenuItem, deleteMenuItem, updateMenuItem, updateMenuDayPrice } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AllergenSelector } from "@/components/AllergenSelector";
import { SortableOrderList } from "@/components/SortableOrderList";
import { MenuCategoryPriceFields } from "@/components/MenuCategoryPriceFields";
import { dishImageSrc } from "@/lib/dishImages";

export const dynamic = "force-dynamic";

function euros(cents: number | null | undefined) {
  return cents == null ? "" : String(cents / 100).replace(".", ",");
}

type MenuItemRecord = NonNullable<Awaited<ReturnType<typeof prisma.menuItem.findFirst>>> & {
  imageMime?: string | null;
  hasImage?: boolean;
  imageVersion?: string | number | null;
  priceUnidadCents?: number | null;
  priceCanaCents?: number | null;
  priceCortadaCents?: number | null;
  priceTercioCents?: number | null;
  priceBotellaPequenaCents?: number | null;
  priceBotellaGrandeCents?: number | null;
  priceCopaCents?: number | null;
  priceBotellaCents?: number | null;
  price100gCents?: number | null;
  priceCuartoKgCents?: number | null;
  priceKiloCents?: number | null;
};

function Fields({ item }: { item?: MenuItemRecord }) {
  return (
    <div className="form-grid">
      <div className="field"><label>Nombre</label><input name="name" required defaultValue={item?.name ?? ""} /></div>
      <MenuCategoryPriceFields
        category={item?.category ?? MenuCategory.ENTRANTES}
        prices={{
          priceTapa: euros(item?.priceTapaCents),
          priceMedia: euros(item?.priceMediaCents),
          pricePlato: euros(item?.pricePlatoCents),
          priceUnidad: euros(item?.priceUnidadCents),
          priceCana: euros(item?.priceCanaCents),
          priceCortada: euros(item?.priceCortadaCents),
          priceTercio: euros(item?.priceTercioCents),
          priceBotellaPequena: euros(item?.priceBotellaPequenaCents),
          priceBotellaGrande: euros(item?.priceBotellaGrandeCents),
          priceCopa: euros(item?.priceCopaCents),
          priceBotella: euros(item?.priceBotellaCents),
          price100g: euros(item?.price100gCents),
          priceCuartoKg: euros(item?.priceCuartoKgCents),
          priceKilo: euros(item?.priceKiloCents),
        }}
      />
      <div className="field full"><label>Descripción</label><textarea name="description" defaultValue={item?.description ?? ""} /></div>
      <div className="field full"><label>Ingredientes (separados por comas)</label><input name="ingredients" defaultValue={item?.ingredients.join(", ") ?? ""} placeholder="tomate, cebolla, aceite de oliva" /></div>
      <div className="field full">
        <label>Imagen</label>
        <p className="field-help">JPG, PNG o WebP. Máximo 1,5 MB. Si no subes ninguna imagen, la web utiliza automáticamente una imagen genérica de su categoría.</p>
        <div className="admin-dish-image-row">
          {item ? <img className="admin-dish-image-preview" src={dishImageSrc(item)} alt={`Vista previa de ${item.name}`} /> : null}
          <div className="admin-dish-image-controls">
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            {item?.hasImage ? <label className="inline-check"><input type="checkbox" name="removeImage" /> Eliminar imagen subida y usar la genérica</label> : null}
          </div>
        </div>
      </div>
      <div className="field full"><label>Alérgenos</label><p className="field-help">Selecciona todos los que correspondan. El listado es cerrado para evitar variantes o errores al escribir.</p><AllergenSelector selected={item?.allergens ?? []} /></div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Visible en la web</label>
    </div>
  );
}

export default async function AdminCartaPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [rawItems, settings, params] = await Promise.all([
    prisma.menuItem.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: ({
        id: true, name: true, description: true, category: true, ingredients: true, allergens: true,
        priceTapaCents: true, priceMediaCents: true, pricePlatoCents: true,
        priceUnidadCents: true, priceCanaCents: true, priceCortadaCents: true, priceTercioCents: true,
        priceBotellaPequenaCents: true, priceBotellaGrandeCents: true, priceCopaCents: true, priceBotellaCents: true,
        price100gCents: true, priceCuartoKgCents: true, priceKiloCents: true,
        active: true, sortOrder: true, imageMime: true, updatedAt: true,
      } as any),
    }) as any,
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: ({ menuBreadPriceCents: true, menuBreadPublished: true, menuDayPriceCents: true } as any) }),
    searchParams,
  ]);
  const items = (rawItems as any[]).map((item) => ({
    ...item,
    hasImage: Boolean(item.imageMime),
    imageVersion: item.updatedAt instanceof Date ? item.updatedAt.getTime() : String(item.updatedAt ?? ""),
  })) as MenuItemRecord[];
  const feedback: Record<string, string> = {
    created: "Elemento creado correctamente.",
    saved: "Cambios guardados correctamente.",
    deleted: "Elemento eliminado correctamente.",
    image_size: "La imagen supera 1,5 MB. Reduce su tamaño e inténtalo de nuevo.",
    image_format: "Formato de imagen no admitido. Utiliza JPG, PNG o WebP.",
    price: "Configuración de pan/picos guardada correctamente.",
  };
  return (
    <div className="admin-page">
      <div className="section-head">
        <div><div className="eyebrow">Carta</div><h2>Platos, bebidas, vinos y chacina</h2><p>Gestiona categorías, formatos de precio, imágenes, ingredientes y alérgenos desde un único lugar.</p></div>
        <a className="button primary" href="/api/admin/carta/pdf">Imprimir carta</a>
      </div>
      {params.status && feedback[params.status] ? <div className={`status-box ${params.status.startsWith("image_") ? "error" : "success"} admin-flash`} role="status">{params.status.startsWith("image_") ? "⚠" : "✓"} {feedback[params.status]}</div> : null}

      <section className="card section-small">
        <div className="eyebrow">Texto auxiliar en la carta</div>
        <h3 style={{ marginTop: 6 }}>Servicio de pan/picos</h3>
        <p className="muted">Esta frase aparecerá dentro de la carta pública y en el PDF solo si marcas la opción de publicar.</p>
        <form action={updateMenuDayPrice} className="form-grid" style={{ marginTop: 14 }}>
          <input type="hidden" name="redirectTo" value="/admin/carta" />
          <div className="field">
            <label>Precio del menú del día (€)</label>
            <input name="menuDayPrice" required inputMode="decimal" defaultValue={euros(settings?.menuDayPriceCents ?? null)} placeholder="18,00" />
          </div>
          <div className="field">
            <label>Servicio de pan/picos (€)</label>
            <input name="menuBreadPrice" inputMode="decimal" defaultValue={euros(settings?.menuBreadPriceCents ?? null)} placeholder="1,00" />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 30 }}><input style={{ width: "auto" }} type="checkbox" name="menuBreadPublished" defaultChecked={settings?.menuBreadPublished ?? false} /> Mostrar la frase en la carta</label>
          <div className="field" style={{ display: "flex", alignItems: "end" }}>
            <button className="button primary" type="submit">Guardar configuración</button>
          </div>
        </form>
      </section>

      <section className="card order-card admin-earth-card">
        <div className="eyebrow">Orden de aparición</div>
        <h3 style={{ marginTop: 6 }}>Arrastra los elementos dentro de cada categoría</h3>
        <p className="muted">Cada categoría mantiene su propio orden, exactamente como se muestra después en la carta y en el PDF. En Bebidas puedes definir directamente precios distintos para caña, cortada, tercio y botella pequeña/grande.</p>
        {Object.values(MenuCategory).map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (!categoryItems.length) return null;
          return (
            <div className="order-group" key={category}>
              <h4>{categoryLabel(category)}</h4>
              <SortableOrderList kind="menu" items={categoryItems.map((item) => ({ id: item.id, label: item.name }))} />
            </div>
          );
        })}
      </section>

      <div className="hr" />

      <details className="admin-item" open>
        <summary><span>＋ Añadir elemento a la carta</span></summary>
        <form className="admin-form" action={createMenuItem} encType="multipart/form-data"><Fields /><button className="button primary" type="submit" style={{ marginTop: 16 }}>Crear</button></form>
      </details>

      <div className="hr" />
      {items.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.name}</span><span className="muted">{categoryLabel(item.category)} · {item.active ? "visible" : "oculto"}</span></summary>
          <form className="admin-form" action={updateMenuItem.bind(null, item.id)} encType="multipart/form-data">
            <Fields item={item} />
            <button className="button primary" type="submit" style={{ marginTop: 16 }}>Guardar cambios</button>
          </form>
          <form action={deleteMenuItem.bind(null, item.id)} style={{ marginTop: 10 }}>
            <ConfirmButton message={`¿Eliminar definitivamente ${item.name}?`}>Eliminar definitivamente</ConfirmButton>
          </form>
        </details>
      ))}
    </div>
  );
}
