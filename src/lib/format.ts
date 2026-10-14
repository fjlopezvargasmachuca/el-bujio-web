export const DEFAULT_OPENING_HOURS =
  "martes|Cerrado\nmiércoles|11:00-23:00\njueves|11:00-23:00\nviernes|11:00-23:00\nsábado|11:00-23:00\ndomingo|11:00-17:00\nlunes|11:00-23:00";

export function formatPrice(cents?: number | null) {
  if (cents == null) return null;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function parseEuroToCents(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount * 100);
}

export function splitCsv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    ENTRANTES: "Entrantes",
    PESCADO: "Pescado",
    CARNES: "Carnes",
    BOCADILLOS: "Bocadillos",
    POSTRES: "Postres",
    BEBIDAS: "Bebidas",
    VINOS: "Vinos",
    CHACINA: "Chacina",
    OTROS: "Otros",
  };
  return labels[category] ?? category;
}

export type MenuPriceRecord = {
  priceTapaCents?: number | null;
  priceMediaCents?: number | null;
  pricePlatoCents?: number | null;
  priceUnidadCents?: number | null;
  priceCanaCents?: number | null;
  priceCortadaCents?: number | null;
  priceTercioCents?: number | null;
  priceBotellaPequenaCents?: number | null;
  priceBotellaGrandeCents?: number | null;
  priceCopaCents?: number | null;
  priceBotellaCents?: number | null;
  price100gCents?: number | null;
  priceCuartoKgCents?: number | null;
  priceKiloCents?: number | null;
};

export function menuPricePairs(item: MenuPriceRecord) {
  return [
    ["Tapa", item.priceTapaCents],
    ["Media", item.priceMediaCents],
    ["Plato", item.pricePlatoCents],
    ["Unidad", item.priceUnidadCents],
    ["Caña", item.priceCanaCents],
    ["Cortada", item.priceCortadaCents],
    ["Tercio", item.priceTercioCents],
    ["Botella pequeña", item.priceBotellaPequenaCents],
    ["Botella grande", item.priceBotellaGrandeCents],
    ["Copa", item.priceCopaCents],
    ["Botella", item.priceBotellaCents],
    ["100 g", item.price100gCents],
    ["1/4 kg", item.priceCuartoKgCents],
    ["Kilo", item.priceKiloCents],
  ] as const;
}

export function parseOpeningHours(raw?: string | null) {
  const source = String(raw ?? "").trim() || DEFAULT_OPENING_HOURS;
  return source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [day, ...rest] = line.split("|");
      return {
        day: day?.trim() ?? "",
        hours: rest.join("|").trim() ?? "",
      };
    })
    .filter((item) => item.day && item.hours);
}
