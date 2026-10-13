"use client";

import { useEffect, useState } from "react";
import { PricePills } from "@/components/PricePills";
import { dishImageSrc } from "@/lib/dishImages";

type Dish = {
  name: string;
  description?: string | null;
  id: string;
  category: string;
  hasImage?: boolean;
  imageVersion?: string | number | null;
  ingredients: string[];
  allergens: string[];
  priceTapaCents?: number | null;
  priceMediaCents?: number | null;
  pricePlatoCents?: number | null;
};

export function DishCard({ item }: { item: Dish }) {
  const [open, setOpen] = useState(false);
  const imageSrc = dishImageSrc(item);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="card dish-card" onClick={() => setOpen(true)}>
        <div className="dish-top">
          <h3>{item.name}</h3>
          <span className="orange">Ver detalle →</span>
        </div>
        {item.description ? <p>{item.description}</p> : null}
        <PricePills tapa={item.priceTapaCents} media={item.priceMediaCents} plato={item.pricePlatoCents} />
      </button>
      {open ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="modal dish-modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${item.name}`} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">Detalle del plato</div>
                <h2>{item.name}</h2>
              </div>
              <button className="icon-button" aria-label="Cerrar" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="dish-detail-image-wrap">
              <img className="dish-detail-image" src={imageSrc} alt={`Imagen de ${item.name}`} />
            </div>
            {item.description ? <p className="muted">{item.description}</p> : null}
            <PricePills tapa={item.priceTapaCents} media={item.priceMediaCents} plato={item.pricePlatoCents} />
            <div className="hr" />
            <h3>Ingredientes</h3>
            <div className="tag-row" style={{ marginTop: 10 }}>
              {item.ingredients.length ? item.ingredients.map((ingredient) => <span className="tag" key={ingredient}>{ingredient}</span>) : <span className="muted">Sin información todavía.</span>}
            </div>
            <div style={{ marginTop: 22 }}>
              <h3>Alérgenos</h3>
              <div className="tag-row" style={{ marginTop: 10 }}>
                {item.allergens.length ? item.allergens.map((allergen) => <span className="tag allergen" key={allergen}>{allergen}</span>) : <span className="muted">No hay alérgenos registrados.</span>}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
