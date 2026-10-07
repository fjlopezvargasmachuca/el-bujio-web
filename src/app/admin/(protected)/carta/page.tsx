import { MenuCategory } from "@prisma/client";
import { prisma } from "@/lib/db";
import { categoryLabel } from "@/lib/format";
import { createMenuItem, deleteMenuItem, updateMenuItem } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { AllergenSelector } from "@/components/AllergenSelector";
import { SortableOrderList } from "@/components/SortableOrderList";

export const dynamic = "force-dynamic";

function euros(cents: number | null) {
  return cents == null ? "" : String(cents / 100).replace(".", ",");
}

type MenuItemRecord = NonNullable<Awaited<ReturnType<typeof prisma.menuItem.findFirst>>>;

function Fields({ item }: { item?: MenuItemRecord }) {
  return (
    <div className="form-grid">
      <div className="field"><label>Nombre</label><input name="name" required defaultValue={item?.name ?? ""} /></div>
      <div className="field"><label>Categoría</label><select name="category" defaultValue={item?.category ?? MenuCategory.ENTRANTES}>{Object.values(MenuCategory).map((c) => <option value={c} key={c}>{categoryLabel(c)}</option>)}</select></div>
      <div className="field full"><label>Descripción</label><textarea name="description" defaultValue={item?.description ?? ""} /></div>
      <div className="field full"><label>Ingredientes (separados por comas)</label><input name="ingredients" defaultValue={item?.ingredients.join(", ") ?? ""} placeholder="tomate, cebolla, aceite de oliva" /></div>
      <div className="field full"><label>Alérgenos</label><p className="field-help">Selecciona todos los que correspondan. El listado es cerrado para evitar variantes o errores al escribir.</p><AllergenSelector selected={item?.allergens ?? []} /></div>
      <div className="field"><label>Precio tapa (€)</label><input name="priceTapa" inputMode="decimal" defaultValue={item ? euros(item.priceTapaCents) : ""} /></div>
      <div className="field"><label>Precio media (€)</label><input name="priceMedia" inputMode="decimal" defaultValue={item ? euros(item.priceMediaCents) : ""} /></div>
      <div className="field"><label>Precio plato (€)</label><input name="pricePlato" inputMode="decimal" defaultValue={item ? euros(item.pricePlatoCents) : ""} /></div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Visible en la web</label>
    </div>
  );
}

export default async function AdminCartaPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [items, params] = await Promise.all([
    prisma.menuItem.findMany({ orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }] }),
    searchParams,
  ]);
  const feedback: Record<string, string> = { created: "Plato creado correctamente.", saved: "Cambios guardados correctamente.", deleted: "Plato eliminado correctamente." };
  return (
    <div className="admin-page">
      <div className="section-head"><div><div className="eyebrow">Carta</div><h2>Platos y precios</h2><p>Añade tapa, media y plato de forma independiente. Ingredientes y alérgenos también son editables.</p></div></div>
      {params.status && feedback[params.status] ? <div className="status-box success admin-flash" role="status">✓ {feedback[params.status]}</div> : null}

      <section className="card order-card">
        <div className="eyebrow">Orden de aparición</div>
        <h3 style={{ marginTop: 6 }}>Arrastra los platos dentro de cada categoría</h3>
        <p className="muted">Cada categoría mantiene su propio orden, exactamente como se muestra después en la carta.</p>
        {Object.values(MenuCategory).map((category) => {
          const categoryItems = items.filter((item) => item.category === category);
          if (!categoryItems.length) return null;
          return (
            <div className="order-group" key={category}>
              <h4>{categoryLabel(category)}</h4>
              <SortableOrderList
                kind="menu"
                items={categoryItems.map((item) => ({ id: item.id, label: item.name }))}
              />
            </div>
          );
        })}
      </section>

      <div className="hr" />

      <details className="admin-item" open>
        <summary><span>＋ Añadir plato</span></summary>
        <form className="admin-form" action={createMenuItem}><Fields /><button className="button primary" type="submit" style={{ marginTop: 16 }}>Crear plato</button></form>
      </details>

      <div className="hr" />
      {items.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.name}</span><span className="muted">{categoryLabel(item.category)} · {item.active ? "visible" : "oculto"}</span></summary>
          <form className="admin-form" action={updateMenuItem.bind(null, item.id)}>
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
