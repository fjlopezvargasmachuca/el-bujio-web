const CATEGORY_FALLBACKS: Record<string, string> = {
  ENTRANTES: "/dishes/entrantes.svg",
  PESCADO: "/dishes/pescado.svg",
  CARNES: "/dishes/carnes.svg",
  BOCADILLOS: "/dishes/bocadillos.svg",
  POSTRES: "/dishes/postres.svg",
  OTROS: "/dishes/otros.svg",
};

export function dishImageSrc(item: {
  id?: string;
  category: string;
  hasImage?: boolean;
  imageVersion?: string | number | Date | null;
}) {
  if (item.id && item.hasImage) {
    const version = item.imageVersion ? `?v=${encodeURIComponent(String(item.imageVersion))}` : "";
    return `/api/platos/${encodeURIComponent(item.id)}/imagen${version}`;
  }
  return CATEGORY_FALLBACKS[item.category] ?? CATEGORY_FALLBACKS.OTROS;
}
