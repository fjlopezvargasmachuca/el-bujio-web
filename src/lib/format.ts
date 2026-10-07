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
    OTROS: "Otros",
  };
  return labels[category] ?? category;
}

export function parseOpeningHours(raw?: string | null) {
  return String(raw ?? "")
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
    .filter((item) => item.day);
}
