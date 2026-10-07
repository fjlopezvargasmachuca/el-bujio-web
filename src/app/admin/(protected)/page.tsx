import Link from "next/link";
import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [activeDishes, menuItems, activeOffers, settings] = await Promise.all([
    prisma.menuItem.count({ where: { active: true } }),
    prisma.specialItem.count({ where: { type: SpecialType.MENU_DIA, active: true } }),
    prisma.specialItem.count({ where: { type: SpecialType.OFERTA, active: true } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div className="admin-page">
      <div className="section-head">
        <div><div className="eyebrow">Panel de control</div><h2>Resumen</h2><p>Gestiona la carta, el contenido diario y los datos de contacto del restaurante.</p></div>
        <Link className="button primary" href="/admin/carta">Gestionar carta</Link>
      </div>

      <div className="admin-grid">
        <div className="card"><div className="muted">Platos activos</div><div className="stat">{activeDishes}</div></div>
        <div className="card"><div className="muted">Elementos del menú del día</div><div className="stat">{menuItems}</div></div>
        <div className="card"><div className="muted">Ofertas activas</div><div className="stat">{activeOffers}</div></div>
        <div className="card"><div className="muted">Teléfono publicado</div><div className="stat" style={{ fontSize: "1.05rem" }}>{settings?.phone ?? "Pendiente"}</div></div>
      </div>

      <div className="grid two section">
        <section className="card">
          <div className="eyebrow">Carta</div>
          <h3 style={{ marginTop: 5 }}>Platos, precios y alérgenos</h3>
          <p className="muted">Añade, edita, oculta o elimina platos. Puedes configurar precios distintos para tapa, media ración y plato, además de ingredientes y alérgenos.</p>
          <Link className="button" href="/admin/carta">Editar carta</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Contenido diario</div>
          <h3 style={{ marginTop: 5 }}>Menú del día y ofertas</h3>
          <p className="muted">Publica lo que esté disponible hoy y ocúltalo cuando deje de estarlo, sin necesidad de borrar el contenido.</p>
          <Link className="button" href="/admin/especiales">Editar menú y ofertas</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Datos del local</div>
          <h3 style={{ marginTop: 5 }}>Contacto y redes sociales</h3>
          <p className="muted">Actualiza teléfono, dirección, texto de contacto y enlaces sociales desde un único lugar.</p>
          <Link className="button" href="/admin/contacto">Editar contacto</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Web pública</div>
          <h3 style={{ marginTop: 5 }}>Revisar el resultado</h3>
          <p className="muted">Comprueba cómo ven los clientes la web después de realizar cambios desde administración.</p>
          <Link className="button" href="/">Abrir web</Link>
        </section>
      </div>
    </div>
  );
}
