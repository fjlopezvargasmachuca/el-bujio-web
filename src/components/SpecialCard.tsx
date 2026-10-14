"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { specialImageSrc } from "@/lib/specialImages";

export function SpecialCard({
  item,
  hidePrice = false,
}: {
  item: {
    id?: string;
    type?: string | null;
    name: string;
    description: string | null;
    section: string | null;
    priceCents: number | null;
    ingredients: string[];
    allergens: string[];
    hasImage?: boolean;
    imageVersion?: string | number | null;
  };
  hidePrice?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const imageSrc = specialImageSrc(item);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="card dish-card special-card" onClick={() => setOpen(true)}>
        {item.section ? <div className="special-meta">{item.section}</div> : null}
        <div className="dish-top">
          <h3>{item.name}</h3>
          {!hidePrice && item.priceCents != null ? <strong className="accent">{formatPrice(item.priceCents)}</strong> : null}
        </div>
        {item.description ? <p>{item.description}</p> : null}
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="modal dish-modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${item.name}`} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">Información</div>
                <h2>{item.name}</h2>
              </div>
              <button className="icon-button" aria-label="Cerrar" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="dish-detail-image-wrap">
              <img className="dish-detail-image" src={imageSrc} alt={`Imagen de ${item.name}`} />
            </div>
            {item.description ? <p className="muted">{item.description}</p> : null}
            {!hidePrice && item.priceCents != null ? <p className="accent"><strong>{formatPrice(item.priceCents)}</strong></p> : null}
            <div className="hr" />
            <h3>Ingredientes</h3>
            <div className="tag-row" style={{ marginTop: 10 }}>
              {item.ingredients.length ? item.ingredients.map((v) => <span className="tag" key={v}>{v}</span>) : <span className="muted">Sin información.</span>}
            </div>
            <h3 style={{ marginTop: 20 }}>Alérgenos</h3>
            <div className="tag-row" style={{ marginTop: 10 }}>
              {item.allergens.length ? item.allergens.map((v) => <span className="tag allergen" key={v}>{v}</span>) : <span className="muted">No hay alérgenos registrados.</span>}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
