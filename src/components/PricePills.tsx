import { formatPrice } from "@/lib/format";

export function PricePills({ tapa, media, plato }: { tapa?: number | null; media?: number | null; plato?: number | null }) {
  const prices = [
    ["Tapa", tapa],
    ["Media", media],
    ["Plato", plato],
  ] as const;

  return (
    <div className="price-row">
      {prices.filter(([, value]) => value != null).map(([label, value]) => (
        <span className="price-pill" key={label}><strong>{label}:</strong> {formatPrice(value)}</span>
      ))}
    </div>
  );
}
