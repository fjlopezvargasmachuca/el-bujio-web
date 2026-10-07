"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const nav = [
  ["/", "Inicio", "home"],
  ["/menu-del-dia", "Menú del día", "menu"],
  ["/carta", "Carta", "card"],
  ["/ofertas", "Ofertas", "tag"],
  ["/contacto", "Contacto", "pin"],
] as const;

function NavIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "home") return <svg {...common}><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 6h16M4 12h16M4 18h10"/></svg>;
  if (name === "card") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 9h10M7 13h6"/></svg>;
  if (name === "tag") return <svg {...common}><path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8.5" cy="8.5" r="1"/></svg>;
  return <svg {...common}><path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/></svg>;
}

export function PublicShell({ children, phone }: { children: React.ReactNode; phone: string }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("el-bujio-sidebar") === "collapsed");
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("el-bujio-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return (
    <div className={`site-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="mobile-topbar">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <Image className="brand-logo" src="/logo-el-bujio.png" alt="Logo de El Bujio" width={44} height={44} priority />
          <span className="brand-copy"><strong>El Bujio</strong></span>
        </Link>
        <button className="icon-button" aria-label="Abrir menú" onClick={() => setOpen(true)}>☰</button>
      </div>

      {open ? <button className="mobile-overlay" aria-label="Cerrar menú" onClick={() => setOpen(false)} /> : null}

      <aside className={`site-sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand-row">
          <Link className="brand" href="/" onClick={() => setOpen(false)} title="El Bujio">
            <Image className="brand-logo" src="/logo-el-bujio.png" alt="Logo de El Bujio" width={54} height={54} priority />
            <span className="brand-copy"><strong>El Bujio</strong><span>Venta tradicional</span></span>
          </Link>
          <button className="sidebar-collapse-button" type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expandir menú" : "Contraer menú"} title={collapsed ? "Expandir menú" : "Contraer menú"}>
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        <nav className="nav-list" aria-label="Navegación principal">
          {nav.map(([href, label, icon]) => (
            <Link className="nav-link" href={href} key={href} onClick={() => setOpen(false)} title={collapsed ? label : undefined}>
              <span className="nav-icon"><NavIcon name={icon} /></span>
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-label">Contacto</div>
          <a href={`tel:${phone.replace(/\s/g, "")}`} title={phone}><strong>{phone}</strong></a>
        </div>
      </aside>
      <main className="site-main">{children}</main>
    </div>
  );
}
