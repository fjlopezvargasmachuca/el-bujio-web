"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

export function SpecialCard({ item, hidePrice = false }: { item: { name: string; description: string | null; section: string | null; priceCents: number | null; ingredients: string[]; allergens: string[] }; hidePrice?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="card dish-card special-card" onClick={() => setOpen(true)}>
        {item.section ? <div className="special-meta">{item.section}</div> : null}
        <div className="dish-top"><h3>{item.name}</h3>{!hidePrice && item.priceCents != null ? <strong className="accent">{formatPrice(item.priceCents)}</strong> : null}</div>
        {item.description ? <p>{item.description}</p> : null}
      </button>
      {open ? (
        <div className="modal-backdrop" onMouseDown={() => setOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><div className="eyebrow">Información</div><h2>{item.name}</h2></div><button className="icon-button" onClick={() => setOpen(false)}>×</button></div>
            {item.description ? <p className="muted">{item.description}</p> : null}
            {!hidePrice && item.priceCents != null ? <p className="accent"><strong>{formatPrice(item.priceCents)}</strong></p> : null}
            <div className="hr" />
            <h3>Ingredientes</h3><div className="tag-row" style={{ marginTop: 10 }}>{item.ingredients.length ? item.ingredients.map((v) => <span className="tag" key={v}>{v}</span>) : <span className="muted">Sin información.</span>}</div>
            <h3 style={{ marginTop: 20 }}>Alérgenos</h3><div className="tag-row" style={{ marginTop: 10 }}>{item.allergens.length ? item.allergens.map((v) => <span className="tag allergen" key={v}>{v}</span>) : <span className="muted">No hay alérgenos registrados.</span>}</div>
          </section>
        </div>
      ) : null}
    </>
  );
}
