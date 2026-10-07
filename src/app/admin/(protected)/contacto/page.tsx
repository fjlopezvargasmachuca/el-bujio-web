import { prisma } from "@/lib/db";
import { updateContact } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminContactPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [settings, params] = await Promise.all([prisma.siteSettings.findUnique({ where: { id: 1 } }), searchParams]);
  return (
    <div className="admin-page">
      <div className="section-head"><div><div className="eyebrow">Contacto</div><h2>Datos públicos</h2><p>Estos datos aparecen en la web pública y pueden editarse cuando cambien.</p></div></div>
      {params.status === "saved" ? <div className="status-box success admin-flash" role="status">✓ Datos de contacto guardados correctamente.</div> : null}
      <form className="card" action={updateContact}>
        <div className="form-grid">
          <div className="field"><label>Teléfono</label><input name="phone" required defaultValue={settings?.phone ?? "956 71 60 77"} /></div>
          <div className="field"><label>Dirección</label><input name="address" required defaultValue={settings?.address ?? "Venta El Bujio · Benamahoma, Cádiz"} /></div>
          <div className="field full"><label>Enlace de Google Maps</label><input name="mapsUrl" type="url" defaultValue={settings?.mapsUrl ?? ""} placeholder="https://www.google.com/maps/..." /></div>
          <div className="field full"><label>Horario (una línea por día, formato día|horario)</label><textarea name="openingHours" defaultValue={settings?.openingHours ?? "martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00"} /></div>
          <div className="field full"><label>Texto de contacto</label><textarea name="contactText" defaultValue={settings?.contactText ?? ""} /></div>
          <div className="field"><label>Instagram URL</label><input name="instagramUrl" type="url" defaultValue={settings?.instagramUrl ?? ""} placeholder="https://instagram.com/..." /></div>
          <div className="field"><label>Facebook URL</label><input name="facebookUrl" type="url" defaultValue={settings?.facebookUrl ?? ""} placeholder="https://facebook.com/..." /></div>
        </div>
        <button className="button primary" style={{ marginTop: 16 }}>Guardar contacto</button>
      </form>
    </div>
  );
}
