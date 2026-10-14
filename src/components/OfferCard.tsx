"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { dishImageSrc } from "@/lib/dishImages";
import { specialImageSrc } from "@/lib/specialImages";

export type OfferDish = {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  ingredients: string[];
  allergens: string[];
  hasImage?: boolean;
  imageVersion?: string | number | null;
};

export function OfferCard({ offer }: {
  offer: {
    id: string;
    name: string;
    description?: string | null;
    priceCents: number | null;
    dishes: OfferDish[];
    hasImage?: boolean;
    imageVersion?: string | number | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const offerImage = specialImageSrc({ id: offer.id, type: "OFERTA", hasImage: offer.hasImage, imageVersion: offer.imageVersion });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="card dish-card offer-card" onClick={() => setOpen(true)}>
        <div className="offer-card-image-wrap"><img className="offer-card-image" src={offerImage} alt={`Imagen de ${offer.name}`} /></div>
        <div className="dish-top">
          <h3>{offer.name}</h3>
          {offer.priceCents != null ? <strong className="accent">{formatPrice(offer.priceCents)}</strong> : null}
        </div>
        {offer.description ? <p>{offer.description}</p> : null}
        {offer.dishes.length ? <p className="offer-dish-summary">Incluye: {offer.dishes.map((dish) => dish.name).join(" + ")}</p> : null}
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section className="modal offer-modal" role="dialog" aria-modal="true" aria-label={`Detalle de ${offer.name}`} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="eyebrow">Oferta</div>
                <h2>{offer.name}</h2>
              </div>
              <button className="icon-button" aria-label="Cerrar" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="dish-detail-image-wrap offer-detail-image-wrap">
              <img className="dish-detail-image" src={offerImage} alt={`Imagen de ${offer.name}`} />
            </div>
            {offer.description ? <p className="muted">{offer.description}</p> : null}
            {offer.priceCents != null ? <p className="offer-price"><strong>{formatPrice(offer.priceCents)}</strong></p> : null}

            <div className="offer-dish-grid">
              {offer.dishes.map((dish) => (
                <article className="offer-dish-item" key={dish.id}>
                  <img src={dishImageSrc(dish)} alt={`Imagen de ${dish.name}`} />
                  <div>
                    <h3>{dish.name}</h3>
                    {dish.description ? <p className="muted">{dish.description}</p> : null}
                    {dish.ingredients.length ? <p><strong>Ingredientes:</strong> {dish.ingredients.join(", ")}</p> : null}
                    {dish.allergens.length ? <p><strong>Alérgenos:</strong> {dish.allergens.join(", ")}</p> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
