import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createSpecialItem, deleteSpecialItem, updateMenuDayPrice, updateSpecialItem } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AllergenSelector } from "@/components/AllergenSelector";
import { SortableOrderList } from "@/components/SortableOrderList";
import { specialImageSrc } from "@/lib/specialImages";

export const dynamic = "force-dynamic";

function euros(cents: number | null | undefined) {
  return cents == null ? "" : String(cents / 100).replace(".", ",");
}

type Special = NonNullable<Awaited<ReturnType<typeof prisma.specialItem.findFirst>>> & {
  hasImage?: boolean;
  imageVersion?: string | number | null;
};

function Fields({ item }: { item?: Special }) {
  const isMenu = item?.type !== SpecialType.OFERTA;
  return (
    <div className="form-grid">
      <div className="field"><label>Tipo</label><select name="type" defaultValue={item?.type ?? SpecialType.MENU_DIA}><option value={SpecialType.MENU_DIA}>Menú del día</option><option value={SpecialType.OFERTA}>Oferta</option></select></div>
      <div className="field"><label>Sección</label><select name="section" defaultValue={item?.section ?? ""}><option value="">Sin sección</option><option value="Primeros">Primeros</option><option value="Segundos">Segundos</option><option value="Postres">Postres</option></select></div>
      <div className="field full"><label>Nombre</label><input name="name" required defaultValue={item?.name ?? ""} /></div>
      <div className="field full"><label>Descripción</label><textarea name="description" defaultValue={item?.description ?? ""} /></div>
      <div className="field full"><label>Ingredientes</label><input name="ingredients" defaultValue={item?.ingredients.join(", ") ?? ""} /></div>
      <div className="field full">
        <label>Imagen</label>
        <p className="field-help">JPG, PNG o WebP. Máximo 1,5 MB. Si no subes ninguna imagen, se utilizará una imagen genérica.</p>
        <div className="admin-dish-image-row">
          {item ? <img className="admin-dish-image-preview" src={specialImageSrc(item)} alt={`Vista previa de ${item.name}`} /> : null}
          <div className="admin-dish-image-controls">
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            {item?.hasImage ? <label className="inline-check"><input type="checkbox" name="removeImage" /> Eliminar imagen subida y usar la genérica</label> : null}
          </div>
        </div>
      </div>
      <div className="field full"><label>Alérgenos</label><p className="field-help">Selecciona uno o varios alérgenos del listado oficial.</p><AllergenSelector selected={item?.allergens ?? []} /></div>
      <div className="field"><label>Precio (€), solo para ofertas</label><input name="price" inputMode="decimal" defaultValue={item ? euros(item.priceCents) : ""} placeholder={isMenu ? "El precio del menú se configura arriba" : "12,50"} /></div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Publicado</label>
    </div>
  );
}

export default async function AdminSpecialsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [rawItems, settings, params] = await Promise.all([
    prisma.specialItem.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }) as any,
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    searchParams,
  ]);

  const items = (rawItems as any[]).map((item) => ({
    ...item,
    hasImage: Boolean(item.imageMime),
    imageVersion: item.updatedAt instanceof Date ? item.updatedAt.getTime() : String(item.updatedAt ?? ""),
  })) as Special[];

  const feedback: Record<string, string> = {
    created: "Elemento creado correctamente.",
    saved: "Cambios guardados correctamente.",
    deleted: "Elemento eliminado correctamente.",
    price: "Precio y notas del menú guardados correctamente.",
    image_size: "La imagen supera 1,5 MB. Reduce su tamaño e inténtalo de nuevo.",
    image_format: "Formato de imagen no admitido. Utiliza JPG, PNG o WebP.",
  };

  const menuItems = items.filter((item) => item.type === SpecialType.MENU_DIA);
  const offerItems = items.filter((item) => item.type === SpecialType.OFERTA);
  const menuSections = ["Primeros", "Segundos", "Postres"] as const;

  return (
    <div className="admin-page">
      <div className="section-head"><div><div className="eyebrow">Contenido diario</div><h2>Menú del día y ofertas</h2><p>Gestiona las opciones del menú, sus imágenes y las promociones que se muestran a los clientes.</p></div></div>
      {params.status && feedback[params.status] ? <div className={`status-box ${params.status.startsWith("image_") ? "error" : "success"} admin-flash`} role="status">{params.status.startsWith("image_") ? "⚠" : "✓"} {feedback[params.status]}</div> : null}

      <section className="card">
        <div className="eyebrow">Precio y nota del menú del día</div>
        <h3 style={{ marginTop: 6 }}>Configuración general</h3>
        <p className="muted">Aquí puedes definir el precio del menú y la frase opcional del servicio de pan/picos que aparece dentro de la carta.</p>
        <form action={updateMenuDayPrice} className="form-grid" style={{ marginTop: 14 }}>
          <input type="hidden" name="redirectTo" value="/admin/especiales" />
          <div className="field">
            <label>Precio del menú (€)</label>
            <input name="menuDayPrice" required inputMode="decimal" defaultValue={euros(settings?.menuDayPriceCents ?? null)} placeholder="18,00" />
          </div>
          <div className="field">
            <label>Servicio de pan/picos (€)</label>
            <input name="menuBreadPrice" inputMode="decimal" defaultValue={euros((settings as any)?.menuBreadPriceCents ?? null)} placeholder="1,00" />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 30 }}><input style={{ width: "auto" }} type="checkbox" name="menuBreadPublished" defaultChecked={(settings as any)?.menuBreadPublished ?? false} /> Mostrar “Servicio de pan/picos” en la carta</label>
          <div className="field" style={{ display: "flex", alignItems: "end" }}>
            <button className="button primary" type="submit">Guardar configuración</button>
          </div>
        </form>
      </section>

      <section className="card order-card section-small">
        <div className="eyebrow">Orden del menú del día</div>
        <h3 style={{ marginTop: 6 }}>Arrastra los platos dentro de cada sección</h3>
        {menuSections.map((section) => {
          const sectionItems = menuItems.filter((item) => item.section === section);
          if (!sectionItems.length) return null;
          return (
            <div className="order-group" key={section}>
              <h4>{section}</h4>
              <SortableOrderList kind="special" items={sectionItems.map((item) => ({ id: item.id, label: item.name }))} />
            </div>
          );
        })}
      </section>

      <section className="card order-card section-small">
        <div className="eyebrow">Orden de ofertas</div>
        <h3 style={{ marginTop: 6 }}>Arrastra las ofertas</h3>
        <SortableOrderList kind="special" items={offerItems.map((item) => ({ id: item.id, label: item.name, meta: item.active ? "Publicada" : "Oculta" }))} />
      </section>

      <div className="hr" />
      <details className="admin-item" open><summary>＋ Añadir elemento</summary><form className="admin-form" action={createSpecialItem} encType="multipart/form-data"><Fields /><button className="button primary" style={{ marginTop: 16 }}>Crear</button></form></details>
      <div className="hr" />
      {items.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.name}</span><span className="muted">{item.type === SpecialType.OFERTA ? "Oferta" : `Menú del día · ${item.section ?? "Sin sección"}`} · {item.active ? "publicado" : "oculto"}</span></summary>
          <form className="admin-form" action={updateSpecialItem.bind(null, item.id)} encType="multipart/form-data"><Fields item={item} /><button className="button primary" style={{ marginTop: 16 }}>Guardar cambios</button></form>
          <form action={deleteSpecialItem.bind(null, item.id)} style={{ marginTop: 10 }}><ConfirmButton message={`¿Eliminar definitivamente ${item.name}?`}>Eliminar definitivamente</ConfirmButton></form>
        </details>
      ))}
    </div>
  );
}
