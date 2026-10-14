import Link from "next/link";
import { SpecialType } from "@prisma/client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [activeDishes, landProducts, menuItems, activeOffers, settings] = await Promise.all([
    prisma.menuItem.count({ where: { active: true } }),
    (prisma as any).landProduct.count({ where: { active: true } }),
    prisma.specialItem.count({ where: { type: SpecialType.MENU_DIA, active: true } }),
    prisma.specialItem.count({ where: { type: SpecialType.OFERTA, active: true } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <div className="admin-page">
      <div className="section-head">
        <div><div className="eyebrow">Panel de control</div><h2>Resumen</h2><p>Gestiona la carta, productos para llevar, contenido diario y datos públicos de la venta.</p></div>
      </div>

      <div className="admin-grid">
        <div className="card"><div className="muted">Elementos de carta</div><div className="stat">{activeDishes}</div></div>
        <div className="card"><div className="muted">Productos de la tierra</div><div className="stat">{landProducts}</div></div>
        <div className="card"><div className="muted">Menú del día</div><div className="stat">{menuItems}</div></div>
        <div className="card"><div className="muted">Ofertas activas</div><div className="stat">{activeOffers}</div></div>
      </div>

      <div className="grid two section">
        <section className="card">
          <div className="eyebrow">Carta</div>
          <h3 style={{ marginTop: 5 }}>Comida, bebidas, vinos y chacina</h3>
          <p className="muted">Gestiona imágenes, alérgenos y formatos de precio: tapa, ración, unidad, copa, botella o peso.</p>
          <div className="row-actions"><Link className="button" href="/admin/carta">Editar carta</Link><a className="button primary" href="/api/admin/carta/pdf">Imprimir carta</a></div>
        </section>
        <section className="card">
          <div className="eyebrow">Para llevar</div>
          <h3 style={{ marginTop: 5 }}>Productos de la tierra</h3>
          <p className="muted">Añade productos de la zona con su precio, imagen, visibilidad y orden manual.</p>
          <Link className="button" href="/admin/productos-tierra">Editar productos</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Contenido diario</div>
          <h3 style={{ marginTop: 5 }}>Menú del día y ofertas</h3>
          <p className="muted">Publica lo disponible hoy y ocúltalo cuando deje de estarlo, sin necesidad de borrar el contenido.</p>
          <Link className="button" href="/admin/especiales">Editar menú y ofertas</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Datos públicos</div>
          <h3 style={{ marginTop: 5 }}>Contacto, horario y portada</h3>
          <p className="muted">Actualiza teléfono, dirección, horario, mapa y las imágenes principales del sitio.</p>
          <Link className="button" href="/admin/contacto">Editar datos públicos</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Web pública</div>
          <h3 style={{ marginTop: 5 }}>Revisar el resultado</h3>
          <p className="muted">Comprueba cómo ven los clientes la web después de realizar cambios.</p>
          <Link className="button" href="/">Abrir web</Link>
        </section>
        <section className="card">
          <div className="eyebrow">Contacto publicado</div>
          <h3 style={{ marginTop: 5 }}>{settings?.phone ?? "Pendiente"}</h3>
          <p className="muted">Teléfono mostrado actualmente a los clientes.</p>
          <Link className="button" href="/admin/contacto">Editar contactos</Link>
        </section>
      </div>
    </div>
  );
}
