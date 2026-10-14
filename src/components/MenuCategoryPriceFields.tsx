"use client";

import { useState } from "react";

const CATEGORIES = [
  ["ENTRANTES", "Entrantes"],
  ["PESCADO", "Pescado"],
  ["CARNES", "Carnes"],
  ["BOCADILLOS", "Bocadillos"],
  ["POSTRES", "Postres"],
  ["BEBIDAS", "Bebidas"],
  ["VINOS", "Vinos"],
  ["CHACINA", "Chacina"],
  ["OTROS", "Otros"],
] as const;

type PriceValues = {
  priceTapa?: string;
  priceMedia?: string;
  pricePlato?: string;
  priceUnidad?: string;
  priceCana?: string;
  priceCortada?: string;
  priceTercio?: string;
  priceBotellaPequena?: string;
  priceBotellaGrande?: string;
  priceCopa?: string;
  priceBotella?: string;
  price100g?: string;
  priceCuartoKg?: string;
  priceKilo?: string;
};

function PriceInput({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input name={name} inputMode="decimal" defaultValue={defaultValue ?? ""} placeholder="0,00" />
    </div>
  );
}

export function MenuCategoryPriceFields({ category: initialCategory, prices }: { category: string; prices: PriceValues }) {
  const [category, setCategory] = useState(initialCategory);

  return (
    <>
      <div className="field">
        <label>Categoría</label>
        <select name="category" value={category} onChange={(event) => setCategory(event.target.value)}>
          {CATEGORIES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </div>

      <div className="field full pricing-editor">
        <div className="pricing-editor-head">
          <div>
            <label>Precios</label>
            <p className="field-help">Rellena únicamente los formatos que correspondan. Los que queden vacíos no se mostrarán al cliente.</p>
          </div>
        </div>
        <div className="pricing-fields-grid">
          {(["ENTRANTES", "PESCADO", "CARNES", "BOCADILLOS", "POSTRES"].includes(category)) ? (
            <>
              <PriceInput name="priceTapa" label="Tapa (€)" defaultValue={prices.priceTapa} />
              <PriceInput name="priceMedia" label="Media ración (€)" defaultValue={prices.priceMedia} />
              <PriceInput name="pricePlato" label="Plato / ración (€)" defaultValue={prices.pricePlato} />
            </>
          ) : null}

          {category === "BEBIDAS" ? (
            <>
              <PriceInput name="priceUnidad" label="Unidad genérica (€)" defaultValue={prices.priceUnidad} />
              <PriceInput name="priceCana" label="Caña (€)" defaultValue={prices.priceCana} />
              <PriceInput name="priceCortada" label="Cortada (€)" defaultValue={prices.priceCortada} />
              <PriceInput name="priceTercio" label="Tercio (€)" defaultValue={prices.priceTercio} />
              <PriceInput name="priceBotellaPequena" label="Botella pequeña (€)" defaultValue={prices.priceBotellaPequena} />
              <PriceInput name="priceBotellaGrande" label="Botella grande (€)" defaultValue={prices.priceBotellaGrande} />
            </>
          ) : null}

          {category === "VINOS" ? (
            <>
              <PriceInput name="priceCopa" label="Copa (€)" defaultValue={prices.priceCopa} />
              <PriceInput name="priceBotella" label="Botella (€)" defaultValue={prices.priceBotella} />
            </>
          ) : null}

          {category === "CHACINA" ? (
            <>
              <PriceInput name="priceUnidad" label="Unidad (€)" defaultValue={prices.priceUnidad} />
              <PriceInput name="price100g" label="100 g (€)" defaultValue={prices.price100g} />
              <PriceInput name="priceCuartoKg" label="1/4 kilo (€)" defaultValue={prices.priceCuartoKg} />
              <PriceInput name="priceKilo" label="Kilo (€)" defaultValue={prices.priceKilo} />
            </>
          ) : null}

          {category === "OTROS" ? (
            <>
              <PriceInput name="priceUnidad" label="Unidad (€)" defaultValue={prices.priceUnidad} />
              <PriceInput name="pricePlato" label="Plato / ración (€)" defaultValue={prices.pricePlato} />
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
