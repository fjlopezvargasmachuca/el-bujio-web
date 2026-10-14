import { prisma } from "@/lib/db";
import { createLandProduct, deleteLandProduct, updateLandProduct } from "../actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SortableOrderList } from "@/components/SortableOrderList";
import { landProductImageSrc } from "@/lib/landProductImages";

export const dynamic = "force-dynamic";

function euros(cents: number | null | undefined) {
  return cents == null ? "" : String(cents / 100).replace(".", ",");
}

type LandProductRecord = { id: string; name: string; description: string | null; priceCents: number | null; imageData?: string | null; imageMime: string | null; active: boolean; sortOrder: number; updatedAt: Date; hasImage?: boolean; imageVersion?: string | number | null; };

function Fields({ item }: { item?: LandProductRecord }) {
  return (
    <div className="form-grid">
      <div className="field"><label>Nombre</label><input name="name" required defaultValue={item?.name ?? ""} /></div>
      <div className="field"><label>Precio por unidad (€)</label><input name="price" inputMode="decimal" defaultValue={euros(item?.priceCents)} placeholder="0,00" /></div>
      <div className="field full"><label>Descripción</label><textarea name="description" defaultValue={item?.description ?? ""} /></div>
      <div className="field full">
        <label>Imagen del producto</label>
        <p className="field-help">JPG, PNG o WebP. Máximo 1,5 MB. Si no subes una imagen se usa una ilustración genérica.</p>
        <div className="admin-dish-image-row">
          {item ? <img className="admin-dish-image-preview" src={landProductImageSrc(item)} alt={`Vista previa de ${item.name}`} /> : null}
          <div className="admin-dish-image-controls">
            <input name="image" type="file" accept="image/jpeg,image/png,image/webp" />
            {item?.hasImage ? <label className="inline-check"><input type="checkbox" name="removeImage" /> Eliminar imagen subida y usar la genérica</label> : null}
          </div>
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}><input style={{ width: "auto" }} type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Visible en la web</label>
    </div>
  );
}

export default async function AdminLandProductsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [rawItems, params] = await Promise.all([
    (prisma as any).landProduct.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    searchParams,
  ]);
  const items = (rawItems as any[]).map((item: any) => ({ ...item, hasImage: Boolean(item.imageMime), imageVersion: item.updatedAt.getTime() })) as LandProductRecord[];
  const feedback: Record<string, string> = {
    created: "Producto creado correctamente.",
    saved: "Cambios guardados correctamente.",
    deleted: "Producto eliminado correctamente.",
    image_size: "La imagen supera 1,5 MB. Reduce su tamaño e inténtalo de nuevo.",
    image_format: "Formato de imagen no admitido. Utiliza JPG, PNG o WebP.",
  };

  return (
    <div className="admin-page">
      <div className="section-head"><div><div className="eyebrow">Tienda</div><h2>Productos de la tierra</h2><p>Gestiona productos por unidad como miel, sal, aceite u otros artículos para llevar.</p></div></div>
      {params.status && feedback[params.status] ? <div className={`status-box ${params.status.startsWith("image_") ? "error" : "success"} admin-flash`} role="status">{params.status.startsWith("image_") ? "⚠" : "✓"} {feedback[params.status]}</div> : null}

      <section className="card order-card admin-earth-card">
        <div className="eyebrow">Orden de aparición</div>
        <h3 style={{ marginTop: 6 }}>Arrastra los productos para ordenarlos</h3>
        <SortableOrderList kind="land" items={items.map((item) => ({ id: item.id, label: item.name }))} />
      </section>

      <div className="hr" />
      <details className="admin-item" open>
        <summary><span>＋ Añadir producto</span></summary>
        <form className="admin-form" action={createLandProduct} encType="multipart/form-data"><Fields /><button className="button primary" type="submit" style={{ marginTop: 16 }}>Crear producto</button></form>
      </details>

      <div className="hr" />
      {items.map((item) => (
        <details className="admin-item" key={`${item.id}-${params.status ?? "idle"}`}>
          <summary><span>{item.name}</span><span className="muted">{item.active ? "visible" : "oculto"}</span></summary>
          <form className="admin-form" action={updateLandProduct.bind(null, item.id)} encType="multipart/form-data"><Fields item={item} /><button className="button primary" type="submit" style={{ marginTop: 16 }}>Guardar cambios</button></form>
          <form action={deleteLandProduct.bind(null, item.id)} style={{ marginTop: 10 }}><ConfirmButton message={`¿Eliminar definitivamente ${item.name}?`}>Eliminar definitivamente</ConfirmButton></form>
        </details>
      ))}
    </div>
  );
}
