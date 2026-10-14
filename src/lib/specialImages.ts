export function specialImageSrc(item: {
  id?: string;
  type?: string | null;
  section?: string | null;
  hasImage?: boolean;
  imageVersion?: string | number | Date | null;
}) {
  if (item.id && item.hasImage) {
    const version = item.imageVersion ? `?v=${encodeURIComponent(String(item.imageVersion))}` : "";
    return `/api/especiales/${encodeURIComponent(item.id)}/imagen${version}`;
  }

  const section = String(item.section ?? "").toLowerCase();
  if (section === "primeros") return "/dishes/entrantes.svg";
  if (section === "segundos") return "/dishes/carnes.svg";
  if (section === "postres") return "/dishes/postres.svg";
  if (item.type === "OFERTA") return "/dishes/otros.svg";
  return "/dishes/otros.svg";
}
