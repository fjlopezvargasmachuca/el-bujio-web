"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { landProductImageSrc } from "@/lib/landProductImages";

type LandProduct = {
  id: string;
  name: string;
  description?: string | null;
  priceCents?: number | null;
  hasImage?: boolean;
  imageVersion?: string | number | null;
};

export function LandProductCard({ item }: { item: LandProduct }) {
  const [open, setOpen] = useState(false);
  const imageSrc = landProductImageSrc(item);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="card dish-card product-card" onClick={() => setOpen(true)}>
        <div className="dish-top">
          <h3>{item.name}</h3>
          <span className="accent">Ver detalle →</span>
        </div>
        {item.description ? <p>{item.description}</p> : null}
        {item.priceCents != null ? <div className="price-row"><span className="price-pill"><strong>Unidad:</strong> {formatPrice(item.priceCents)}</span></div> : null}
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="modal dish-modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${item.name}`} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><div className="eyebrow">Producto de la tierra</div><h2>{item.name}</h2></div>
              <button className="icon-button" aria-label="Cerrar" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="dish-detail-image-wrap"><img className="dish-detail-image" src={imageSrc} alt={`Imagen de ${item.name}`} /></div>
            {item.description ? <p className="muted">{item.description}</p> : null}
            {item.priceCents != null ? <div className="price-row"><span className="price-pill"><strong>Unidad:</strong> {formatPrice(item.priceCents)}</span></div> : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
