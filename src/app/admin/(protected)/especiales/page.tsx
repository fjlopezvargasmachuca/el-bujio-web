import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { categoryLabel } from "@/lib/format";
import { createSpecialItem, deleteSpecialItem, updateMenuDayPrice, updateSpecialItem } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SortableOrderList } from "@/components/SortableOrderList";

export const dynamic = "force-dynamic";

function euros(cents: number | null | undefined) {
  return cents == null ? "" : String(cents / 100).replace(".", ",");
}

type DishOption = {
  id: string;
  name: string;
  category: string;
  active: boolean;
};

type SpecialRecord = {
  id: string;
  type: SpecialType;
  name: string;
  description: string | null;
  section: string | null;
  priceCents: number | null;
  active: boolean;
  sortOrder: number;
  selections: Array<{ menuItemId: string; sortOrder: number; menuItem: DishOption }>;
};

function DishSelect({ dishes, selectedId }: { dishes: DishOption[]; selectedId?: string }) {
  return (
    <select name="menuItemId" defaultValue={selectedId ?? ""} required>
      <option value="">Selecciona un plato de la carta</option>
      {Array.from(new Set(dishes.map((dish) => dish.category))).map((category) => (
        <optgroup key={category} label={categoryLabel(category)}>
          {dishes.filter((dish) => dish.category === category).map((dish) => (
            <option key={dish.id} value={dish.id}>{dish.name}{dish.active ? "" : " · oculto en carta"}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

function DishCheckboxes({ dishes, selectedIds = [] }: { dishes: DishOption[]; selectedIds?: string[] }) {
  const selected = new Set(selectedIds);
  const categories = Array.from(new Set(dishes.map((dish) => dish.category)));
  return (
    <div className="special-dish-selector">
      {categories.map((category) => (
        <fieldset key={category}>
          <legend>{categoryLabel(category)}</legend>
          <div className="special-dish-checks">
            {dishes.filter((dish) => dish.category === category).map((dish) => (
              <label className="inline-check special-dish-check" key={dish.id}>
                <input type="checkbox" name="menuItemIds" value={dish.id} defaultChecked={selected.has(dish.id)} />
                <span>{dish.name}{dish.active ? "" : " · oculto en carta"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function MenuFields({ dishes, item }: { dishes: DishOption[]; item?: SpecialRecord }) {
  const selectedId = item?.selections[0]?.menuItemId;
  return (
    <div className="form-grid">
      <input type="hidden" name="type" value={SpecialType.MENU_DIA} />
      <div className="field full">
        <label>Plato de la carta</label>
        <DishSelect dishes={dishes} selectedId={selectedId} />
        <p className="field-help">El nombre, la imagen, los ingredientes y los alérgenos se toman directamente de la Carta. No tendrás que escribirlos dos veces.</p>
      </div>
      <div className="field">
        <label>Sección</label>
        <select name="section" defaultValue={item?.section ?? "Primeros"} required>
          <option value="Primeros">Primeros</option>
          <option value="Segundos">Segundos</option>
          <option value="Postres">Postres</option>
        </select>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Publicado
      </label>
      {item && !selectedId ? <div className="status-box warning full">Este elemento procede de una versión anterior. Selecciona ahora el plato correspondiente de la Carta y guarda los cambios.</div> : null}
    </div>
  );
}

function OfferFields({ dishes, item }: { dishes: DishOption[]; item?: SpecialRecord }) {
  const selectedIds = item?.selections.map((selection) => selection.menuItemId) ?? [];
  return (
    <div className="form-grid">
      <input type="hidden" name="type" value={SpecialType.OFERTA} />
      <div className="field"><label>Nombre de la oferta</label><input name="name" required defaultValue={item?.name ?? ""} placeholder="Combo para compartir" /></div>
      <div className="field"><label>Precio de la oferta (€)</label><input name="price" required inputMode="decimal" defaultValue={euros(item?.priceCents)} placeholder="18,00" /></div>
      <div className="field full"><label>Descripción</label><textarea name="description" defaultValue={item?.description ?? ""} placeholder="Descripción opcional de la promoción." /></div>
      <div className="field full">
        <label>Platos incluidos</label>
        <p className="field-help">Selecciona uno o varios platos de la Carta. El precio de esta oferta es independiente y nunca modifica el precio original de los platos.</p>
        <DishCheckboxes dishes={dishes} selectedIds={selectedIds} />
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Publicada
      </label>
      {item && !selectedIds.length ? <div className="status-box warning full">Esta oferta procede de una versión anterior. Selecciona los platos de la Carta que forman parte de ella.</div> : null}
    </div>
  );
}

export default async function AdminSpecialsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [rawItems, dishes, settings, params] = await Promise.all([
    (prisma.specialItem as any).findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      include: ({
        selections: {
          orderBy: { sortOrder: "asc" },
          include: { menuItem: { select: { id: true, name: true, category: true, active: true } } },
        },
      } as any),
    }) as any,
    prisma.menuItem.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, category: true, active: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    searchParams,
  ]);

  const items = rawItems as SpecialRecord[];
  const dishOptions = dishes as DishOption[];

  const feedback: Record<string, string> = {
    created: "Elemento creado correctamente.",
    saved: "Cambios guardados correctamente.",
    deleted: "Elemento eliminado correctamente.",
    price: "Precio del menú guardado correctamente.",
    selection_required: "Selecciona al menos un plato de la Carta.",
    section_required: "Selecciona si el plato pertenece a Primeros, Segundos o Postres.",
    offer_price_required: "Indica el precio de la oferta.",
  };

  const menuItems = items.filter((item) => item.type === SpecialType.MENU_DIA);
  const offerItems = items.filter((item) => item.type === SpecialType.OFERTA);
  const menuSections = ["Primeros", "Segundos", "Postres"] as const;

  return (
    <div className="admin-page">
      <div className="section-head">
        <div>
          <div className="eyebrow">Contenido diario</div>
          <h2>Menú del día y ofertas</h2>
          <p>Selecciona platos ya creados en la Carta para reutilizar su información, imágenes, ingredientes y alérgenos.</p>
        </div>
      </div>

      {params.status && feedback[params.status] ? (
        <div className={`status-box ${["selection_required", "section_required", "offer_price_required"].includes(params.status) ? "error" : "success"} admin-flash`} role="status">
          {["selection_required", "section_required", "offer_price_required"].includes(params.status) ? "⚠" : "✓"} {feedback[params.status]}
        </div>
      ) : null}

      <section className="card">
        <div className="eyebrow">Menú del día</div>
        <h3 style={{ marginTop: 6 }}>Precio general</h3>
        <p className="muted">Los platos se eligen de la Carta. Aquí solo se establece el precio completo del menú.</p>
        <form action={updateMenuDayPrice} className="form-grid" style={{ marginTop: 14 }}>
          <input type="hidden" name="redirectTo" value="/admin/especiales" />
          <input type="hidden" name="menuBreadPrice" value={euros((settings as any)?.menuBreadPriceCents ?? null)} />
          {(settings as any)?.menuBreadPublished ? <input type="hidden" name="menuBreadPublished" value="on" /> : null}
          <div className="field">
            <label>Precio del menú (€)</label>
            <input name="menuDayPrice" required inputMode="decimal" defaultValue={euros(settings?.menuDayPriceCents ?? null)} placeholder="18,00" />
          </div>
          <div className="field" style={{ display: "flex", alignItems: "end" }}><button className="button primary" type="submit">Guardar precio</button></div>
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
              <SortableOrderList kind="special" items={sectionItems.map((item) => ({ id: item.id, label: item.selections[0]?.menuItem.name ?? item.name }))} />
            </div>
          );
        })}
      </section>

      <details className="admin-item" open>
        <summary>＋ Añadir plato al menú del día</summary>
        <form className="admin-form" action={createSpecialItem}><MenuFields dishes={dishOptions} /><button className="button primary" style={{ marginTop: 16 }}>Añadir al menú</button></form>
      </details>

      {menuItems.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.selections[0]?.menuItem.name ?? item.name}</span><span className="muted">{item.section ?? "Sin sección"} · {item.active ? "publicado" : "oculto"}</span></summary>
          <form className="admin-form" action={updateSpecialItem.bind(null, item.id)}><MenuFields dishes={dishOptions} item={item} /><button className="button primary" style={{ marginTop: 16 }}>Guardar cambios</button></form>
          <form action={deleteSpecialItem.bind(null, item.id)} style={{ marginTop: 10 }}><ConfirmButton message="¿Quitar este plato del menú del día?">Quitar del menú</ConfirmButton></form>
        </details>
      ))}

      <div className="hr" />

      <section className="card order-card section-small">
        <div className="eyebrow">Ofertas</div>
        <h3 style={{ marginTop: 6 }}>Orden de aparición</h3>
        <SortableOrderList kind="special" items={offerItems.map((item) => ({ id: item.id, label: item.name, meta: item.active ? "Publicada" : "Oculta" }))} />
      </section>

      <details className="admin-item" open>
        <summary>＋ Crear oferta</summary>
        <form className="admin-form" action={createSpecialItem}><OfferFields dishes={dishOptions} /><button className="button primary" style={{ marginTop: 16 }}>Crear oferta</button></form>
      </details>

      {offerItems.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.name}</span><span className="muted">{item.selections.length} plato{item.selections.length === 1 ? "" : "s"} · {item.active ? "publicada" : "oculta"}</span></summary>
          <form className="admin-form" action={updateSpecialItem.bind(null, item.id)}><OfferFields dishes={dishOptions} item={item} /><button className="button primary" style={{ marginTop: 16 }}>Guardar cambios</button></form>
          <form action={deleteSpecialItem.bind(null, item.id)} style={{ marginTop: 10 }}><ConfirmButton message={`¿Eliminar definitivamente la oferta ${item.name}?`}>Eliminar oferta</ConfirmButton></form>
        </details>
      ))}
    </div>
  );
}
