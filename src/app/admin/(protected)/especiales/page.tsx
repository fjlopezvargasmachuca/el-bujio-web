import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { createSpecialItem, deleteSpecialItem, updateMenuDayPrice, updateSpecialItem } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AllergenSelector } from "@/components/AllergenSelector";
import { SortableOrderList } from "@/components/SortableOrderList";

export const dynamic = "force-dynamic";

function euros(cents: number | null) { return cents == null ? "" : String(cents / 100).replace(".", ","); }

type Special = NonNullable<Awaited<ReturnType<typeof prisma.specialItem.findFirst>>>;

function Fields({ item }: { item?: Special }) {
  const isMenu = item?.type !== SpecialType.OFERTA;
  return (
    <div className="form-grid">
      <div className="field"><label>Tipo</label><select name="type" defaultValue={item?.type ?? SpecialType.MENU_DIA}><option value={SpecialType.MENU_DIA}>Menú del día</option><option value={SpecialType.OFERTA}>Oferta</option></select></div>
      <div className="field"><label>Sección</label><select name="section" defaultValue={item?.section ?? ""}><option value="">Sin sección</option><option value="Primeros">Primeros</option><option value="Segundos">Segundos</option><option value="Postres">Postres</option></select></div>
      <div className="field full"><label>Nombre</label><input name="name" required defaultValue={item?.name ?? ""} /></div>
      <div className="field full"><label>Descripción</label><textarea name="description" defaultValue={item?.description ?? ""} /></div>
      <div className="field full"><label>Ingredientes</label><input name="ingredients" defaultValue={item?.ingredients.join(", ") ?? ""} /></div>
      <div className="field full"><label>Alérgenos</label><p className="field-help">Selecciona uno o varios alérgenos del listado oficial.</p><AllergenSelector selected={item?.allergens ?? []} /></div>
      <div className="field"><label>Precio (€), solo para ofertas</label><input name="price" inputMode="decimal" defaultValue={item ? euros(item.priceCents) : ""} placeholder={isMenu ? "El precio del menú se configura arriba" : "12,50"} /></div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Publicado</label>
    </div>
  );
}

export default async function AdminSpecialsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [items, settings, params] = await Promise.all([
    prisma.specialItem.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    searchParams,
  ]);
  const feedback: Record<string, string> = { created: "Elemento creado correctamente.", saved: "Cambios guardados correctamente.", deleted: "Elemento eliminado correctamente.", price: "Precio del menú guardado correctamente." };

  const menuItems = items.filter((item) => item.type === SpecialType.MENU_DIA);
  const offerItems = items.filter((item) => item.type === SpecialType.OFERTA);
  const menuSections = ["Primeros", "Segundos", "Postres"] as const;

  return (
    <div className="admin-page">
      <div className="section-head"><div><div className="eyebrow">Contenido diario</div><h2>Menú del día y ofertas</h2><p>Gestiona las opciones del menú y las promociones que se muestran a los clientes.</p></div></div>
      {params.status && feedback[params.status] ? <div className="status-box success admin-flash" role="status">✓ {feedback[params.status]}</div> : null}

      <section className="card">
        <div className="eyebrow">Precio del menú del día</div>
        <h3 style={{ marginTop: 6 }}>Precio único del menú</h3>
        <p className="muted">Este precio se muestra junto al menú completo. Los platos individuales del menú del día no llevan precio.</p>
        <form action={updateMenuDayPrice} className="row-actions" style={{ marginTop: 14 }}>
          <div className="field" style={{ minWidth: 220 }}>
            <label>Precio (€)</label>
            <input name="menuDayPrice" required inputMode="decimal" defaultValue={euros(settings?.menuDayPriceCents ?? null)} placeholder="18,00" />
          </div>
          <button className="button primary" type="submit" style={{ alignSelf: "end" }}>Guardar precio</button>
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
              <SortableOrderList
                kind="special"
                items={sectionItems.map((item) => ({ id: item.id, label: item.name }))}
              />
            </div>
          );
        })}
      </section>

      <section className="card order-card section-small">
        <div className="eyebrow">Orden de ofertas</div>
        <h3 style={{ marginTop: 6 }}>Arrastra las ofertas</h3>
        <SortableOrderList
          kind="special"
          items={offerItems.map((item) => ({ id: item.id, label: item.name, meta: item.active ? "Publicada" : "Oculta" }))}
        />
      </section>

      <div className="hr" />
      <details className="admin-item" open><summary>＋ Añadir elemento</summary><form className="admin-form" action={createSpecialItem}><Fields /><button className="button primary" style={{ marginTop: 16 }}>Crear</button></form></details>
      <div className="hr" />
      {items.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.name}</span><span className="muted">{item.type === SpecialType.OFERTA ? "Oferta" : `Menú del día · ${item.section ?? "Sin sección"}`} · {item.active ? "publicado" : "oculto"}</span></summary>
          <form className="admin-form" action={updateSpecialItem.bind(null, item.id)}><Fields item={item} /><button className="button primary" style={{ marginTop: 16 }}>Guardar cambios</button></form>
          <form action={deleteSpecialItem.bind(null, item.id)} style={{ marginTop: 10 }}><ConfirmButton message={`¿Eliminar definitivamente ${item.name}?`}>Eliminar definitivamente</ConfirmButton></form>
        </details>
      ))}
    </div>
  );
}
