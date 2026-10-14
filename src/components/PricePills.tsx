import { formatPrice, menuPricePairs, type MenuPriceRecord } from "@/lib/format";

export function PricePills(props: MenuPriceRecord) {
  const prices = menuPricePairs(props).filter(([, value]) => value != null);
  if (!prices.length) return null;

  return (
    <div className="price-row">
      {prices.map(([label, value], index) => (
        <span className="price-pill" key={`${label || "precio"}-${index}`}>
          {label ? <><strong>{label}:</strong> </> : null}{formatPrice(value)}
        </span>
      ))}
    </div>
  );
}
