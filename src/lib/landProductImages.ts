export function landProductImageSrc(item: {
  id?: string;
  hasImage?: boolean;
  imageVersion?: string | number | Date | null;
}) {
  if (item.id && item.hasImage) {
    const version = item.imageVersion ? `?v=${encodeURIComponent(String(item.imageVersion))}` : "";
    return `/api/productos-tierra/${encodeURIComponent(item.id)}/imagen${version}`;
  }
  return "/products/productos-tierra.svg";
}
