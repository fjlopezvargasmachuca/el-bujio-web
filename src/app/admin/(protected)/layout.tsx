import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAdmin } from "./actions";

const nav = [
  ["/admin", "Resumen"],
  ["/admin/carta", "Carta"],
  ["/admin/especiales", "Menú y ofertas"],
  ["/admin/contacto", "Contacto"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-brand">
          <Image src="/logo-el-bujio.png" alt="Logo El Bujio" width={40} height={40} />
          <div>
            <strong>El Bujio · Administración</strong>
            <div className="muted" style={{ fontSize: ".78rem" }}>{session.email}</div>
          </div>
        </div>
        <nav className="admin-nav">{nav.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}</nav>
        <form action={logoutAdmin}><button className="button small ghost" type="submit">Cerrar sesión</button></form>
      </header>
      {children}
    </div>
  );
}
