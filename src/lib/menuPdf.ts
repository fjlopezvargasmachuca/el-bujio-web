import { ALLERGENS } from "./allergens";
import { categoryLabel, menuPricePairs, type MenuPriceRecord } from "./format";
import { PDF_LOGO_JPEG_BASE64 } from "./pdfLogo";

type MenuPdfItem = MenuPriceRecord & {
  name: string;
  category: string;
  description?: string | null;
  ingredients: string[];
  allergens: string[];
};

type LandPdfItem = {
  name: string;
  description?: string | null;
  priceCents?: number | null;
};

type PdfPage = string[];
type PdfObject = string | Buffer;
type RGB = [number, number, number];

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 42;
const CONTENT_W = PAGE_W - MARGIN * 2;
const TOP = 742;
const BOTTOM = 118;
const CATEGORY_H = 28;
const LAND_ITEM_H = 46;

const INK: RGB = [0.12, 0.09, 0.07];
const EARTH: RGB = [0.47, 0.31, 0.2];
const EARTH_LIGHT: RGB = [0.92, 0.82, 0.67];
const MUTED: RGB = [0.4, 0.31, 0.24];
const ICON_BG: RGB = [0.95, 0.91, 0.85];

const CATEGORY_ORDER = ["ENTRANTES", "CHACINA", "PESCADO", "CARNES", "BOCADILLOS", "POSTRES", "BEBIDAS", "VINOS", "OTROS"];

const LEGEND_LABELS: Record<string, string> = {
  Gluten: "Gluten",
  "Crustáceos": "Crustáceos",
  Huevos: "Huevos",
  Pescado: "Pescado",
  Cacahuetes: "Cacahuetes",
  Soja: "Soja",
  Leche: "Leche",
  "Frutos de cáscara": "Frutos cáscara",
  Apio: "Apio",
  Mostaza: "Mostaza",
  "Sésamo": "Sésamo",
  Sulfitos: "Sulfitos",
  Altramuces: "Altramuces",
  Moluscos: "Moluscos",
};

function cleanText(value: string) {
  return String(value ?? "")
    .replace(/[–—]/g, "-")
    .replace(/“|”/g, '"')
    .replace(/’/g, "'")
    .replace(/€/g, "\x80")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value: string) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function text(page: PdfPage, x: number, y: number, value: string, size = 9, bold = false, color: RGB = INK) {
  page.push(`${color[0]} ${color[1]} ${color[2]} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(value)}) Tj ET`);
}

function centeredText(page: PdfPage, y: number, value: string, size = 7, bold = false, color: RGB = MUTED) {
  const estimatedWidth = cleanText(value).length * size * 0.5;
  text(page, Math.max(MARGIN, (PAGE_W - estimatedWidth) / 2), y, value, size, bold, color);
}

function fillRect(page: PdfPage, x: number, y: number, w: number, h: number, rgb: RGB) {
  page.push(`${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
}

function line(page: PdfPage, x1: number, y1: number, x2: number, y2: number, gray = 0.8, width = 0.55) {
  page.push(`${gray} G ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function colorLine(page: PdfPage, x1: number, y1: number, x2: number, y2: number, color: RGB = EARTH, width = 0.75) {
  page.push(`${color[0]} ${color[1]} ${color[2]} RG ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
  const k = 0.5522847498;
  return [
    `${(cx + rx).toFixed(2)} ${cy.toFixed(2)} m`,
    `${(cx + rx).toFixed(2)} ${(cy + k * ry).toFixed(2)} ${(cx + k * rx).toFixed(2)} ${(cy + ry).toFixed(2)} ${cx.toFixed(2)} ${(cy + ry).toFixed(2)} c`,
    `${(cx - k * rx).toFixed(2)} ${(cy + ry).toFixed(2)} ${(cx - rx).toFixed(2)} ${(cy + k * ry).toFixed(2)} ${(cx - rx).toFixed(2)} ${cy.toFixed(2)} c`,
    `${(cx - rx).toFixed(2)} ${(cy - k * ry).toFixed(2)} ${(cx - k * rx).toFixed(2)} ${(cy - ry).toFixed(2)} ${cx.toFixed(2)} ${(cy - ry).toFixed(2)} c`,
    `${(cx + k * rx).toFixed(2)} ${(cy - ry).toFixed(2)} ${(cx + rx).toFixed(2)} ${(cy - k * ry).toFixed(2)} ${(cx + rx).toFixed(2)} ${cy.toFixed(2)} c`,
    "h",
  ].join(" ");
}

function fillEllipse(page: PdfPage, cx: number, cy: number, rx: number, ry: number, color: RGB) {
  page.push(`q ${color[0]} ${color[1]} ${color[2]} rg ${ellipsePath(cx, cy, rx, ry)} f Q`);
}

function strokeEllipse(page: PdfPage, cx: number, cy: number, rx: number, ry: number, color: RGB = EARTH, width = 0.7) {
  page.push(`q ${color[0]} ${color[1]} ${color[2]} RG ${width} w ${ellipsePath(cx, cy, rx, ry)} S Q`);
}

function fillCircle(page: PdfPage, cx: number, cy: number, radius: number, color: RGB) {
  fillEllipse(page, cx, cy, radius, radius, color);
}

function image(page: PdfPage, x: number, y: number, w: number, h: number) {
  page.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Logo Do Q`);
}

function price(cents?: number | null) {
  if (cents == null) return null;
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

function priceText(item: MenuPdfItem) {
  return menuPricePairs(item)
    .filter(([, value]) => value != null)
    .map(([label, value]) => label ? `${label} ${price(value)}` : `${price(value)}`)
    .join(" · ");
}

function truncate(value: string, max: number) {
  const clean = cleanText(value);
  return clean.length <= max ? clean : `${clean.slice(0, Math.max(0, max - 3))}...`;
}

function wrapText(value: string, maxChars: number, maxLines = 2) {
  const words = cleanText(value).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines) break;
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length > maxLines) lines.length = maxLines;
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    lines[maxLines - 1] = truncate(lines[maxLines - 1], Math.max(8, maxChars - 3));
  }
  return lines;
}

function drawAllergenIcon(page: PdfPage, allergen: string, x: number, y: number, size = 12, withBackground = true) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size;
  const c = EARTH;

  if (withBackground) fillEllipse(page, cx, cy, s * 0.52, s * 0.52, ICON_BG);

  switch (allergen) {
    case "Gluten": {
      colorLine(page, cx, y + s * 0.17, cx, y + s * 0.84, c, 0.75);
      [0.32, 0.5, 0.68].forEach((p) => {
        fillEllipse(page, cx - s * 0.16, y + s * p, s * 0.12, s * 0.07, c);
        fillEllipse(page, cx + s * 0.16, y + s * (p + 0.05), s * 0.12, s * 0.07, c);
      });
      break;
    }
    case "Crustáceos": {
      strokeEllipse(page, cx, cy, s * 0.27, s * 0.22, c, 0.8);
      colorLine(page, cx + s * 0.24, cy + s * 0.06, x + s * 0.86, y + s * 0.72, c, 0.7);
      colorLine(page, cx + s * 0.24, cy, x + s * 0.88, y + s * 0.48, c, 0.7);
      colorLine(page, cx - s * 0.18, y + s * 0.28, x + s * 0.2, y + s * 0.08, c, 0.7);
      colorLine(page, cx, y + s * 0.28, cx, y + s * 0.06, c, 0.7);
      colorLine(page, cx + s * 0.16, y + s * 0.3, x + s * 0.74, y + s * 0.08, c, 0.7);
      break;
    }
    case "Huevos": {
      strokeEllipse(page, cx, cy, s * 0.28, s * 0.36, c, 0.85);
      fillCircle(page, cx, cy - s * 0.04, s * 0.11, c);
      break;
    }
    case "Pescado": {
      strokeEllipse(page, cx - s * 0.05, cy, s * 0.29, s * 0.18, c, 0.8);
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG 0.8 w ${(x + s * 0.77).toFixed(2)} ${cy.toFixed(2)} m ${(x + s * 0.94).toFixed(2)} ${(y + s * 0.72).toFixed(2)} l ${(x + s * 0.94).toFixed(2)} ${(y + s * 0.28).toFixed(2)} l h S Q`);
      fillCircle(page, x + s * 0.37, y + s * 0.57, s * 0.035, c);
      break;
    }
    case "Cacahuetes": {
      strokeEllipse(page, cx - s * 0.11, cy + s * 0.08, s * 0.2, s * 0.28, c, 0.8);
      strokeEllipse(page, cx + s * 0.11, cy - s * 0.08, s * 0.2, s * 0.28, c, 0.8);
      colorLine(page, x + s * 0.35, y + s * 0.34, x + s * 0.66, y + s * 0.65, c, 0.6);
      break;
    }
    case "Soja": {
      strokeEllipse(page, cx, cy, s * 0.34, s * 0.18, c, 0.8);
      [0.37, 0.5, 0.63].forEach((p) => fillCircle(page, x + s * p, cy, s * 0.045, c));
      break;
    }
    case "Leche": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG 0.8 w ${(x + s * 0.3).toFixed(2)} ${(y + s * 0.18).toFixed(2)} ${(s * 0.42).toFixed(2)} ${(s * 0.55).toFixed(2)} re S Q`);
      colorLine(page, x + s * 0.3, y + s * 0.73, x + s * 0.44, y + s * 0.88, c, 0.8);
      colorLine(page, x + s * 0.44, y + s * 0.88, x + s * 0.72, y + s * 0.73, c, 0.8);
      break;
    }
    case "Frutos de cáscara": {
      strokeEllipse(page, cx, cy - s * 0.03, s * 0.25, s * 0.3, c, 0.8);
      colorLine(page, x + s * 0.3, y + s * 0.63, x + s * 0.7, y + s * 0.63, c, 0.8);
      colorLine(page, cx, y + s * 0.77, cx + s * 0.08, y + s * 0.9, c, 0.75);
      break;
    }
    case "Apio": {
      [0.38, 0.5, 0.62].forEach((p) => colorLine(page, x + s * p, y + s * 0.18, x + s * p, y + s * 0.72, c, 0.8));
      fillEllipse(page, x + s * 0.35, y + s * 0.78, s * 0.13, s * 0.08, c);
      fillEllipse(page, x + s * 0.55, y + s * 0.84, s * 0.13, s * 0.08, c);
      fillEllipse(page, x + s * 0.7, y + s * 0.75, s * 0.12, s * 0.07, c);
      break;
    }
    case "Mostaza": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG 0.8 w ${(x + s * 0.34).toFixed(2)} ${(y + s * 0.2).toFixed(2)} ${(s * 0.34).toFixed(2)} ${(s * 0.48).toFixed(2)} re S Q`);
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG 0.8 w ${(x + s * 0.41).toFixed(2)} ${(y + s * 0.68).toFixed(2)} ${(s * 0.2).toFixed(2)} ${(s * 0.12).toFixed(2)} re S Q`);
      colorLine(page, x + s * 0.43, y + s * 0.42, x + s * 0.59, y + s * 0.42, c, 1.0);
      break;
    }
    case "Sésamo": {
      fillEllipse(page, x + s * 0.36, y + s * 0.62, s * 0.08, s * 0.14, c);
      fillEllipse(page, x + s * 0.6, y + s * 0.62, s * 0.08, s * 0.14, c);
      fillEllipse(page, x + s * 0.49, y + s * 0.34, s * 0.08, s * 0.14, c);
      break;
    }
    case "Sulfitos": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG 0.8 w ${(x + s * 0.3).toFixed(2)} ${(y + s * 0.78).toFixed(2)} m ${(x + s * 0.4).toFixed(2)} ${(y + s * 0.45).toFixed(2)} l ${(x + s * 0.6).toFixed(2)} ${(y + s * 0.45).toFixed(2)} l ${(x + s * 0.7).toFixed(2)} ${(y + s * 0.78).toFixed(2)} l S Q`);
      colorLine(page, cx, y + s * 0.45, cx, y + s * 0.2, c, 0.8);
      colorLine(page, x + s * 0.38, y + s * 0.2, x + s * 0.62, y + s * 0.2, c, 0.8);
      break;
    }
    case "Altramuces": {
      colorLine(page, cx, y + s * 0.16, cx, y + s * 0.82, c, 0.75);
      [[0.38,0.68],[0.62,0.62],[0.4,0.5],[0.61,0.42]].forEach(([px,py]) => fillCircle(page, x + s * px, y + s * py, s * 0.08, c));
      break;
    }
    case "Moluscos": {
      strokeEllipse(page, cx, y + s * 0.45, s * 0.3, s * 0.24, c, 0.8);
      colorLine(page, x + s * 0.22, y + s * 0.32, x + s * 0.78, y + s * 0.32, c, 0.8);
      [0.35,0.5,0.65].forEach((p) => colorLine(page, cx, y + s * 0.34, x + s * p, y + s * 0.67, c, 0.55));
      break;
    }
    default:
      fillCircle(page, cx, cy, s * 0.18, c);
  }
}

function drawCategoryArtwork(page: PdfPage, category: string, x: number, y: number, size = 38) {
  const c: RGB = [0.84, 0.74, 0.61];
  const w = Math.max(0.75, size / 50);
  const cx = x + size / 2;
  const cy = y + size / 2;

  switch (category) {
    case "ENTRANTES": {
      strokeEllipse(page, cx, cy, size * 0.34, size * 0.16, c, w);
      colorLine(page, x + size * 0.18, y + size * 0.39, x + size * 0.82, y + size * 0.39, c, w);
      colorLine(page, x + size * 0.37, y + size * 0.58, x + size * 0.3, y + size * 0.78, c, w);
      colorLine(page, x + size * 0.62, y + size * 0.58, x + size * 0.72, y + size * 0.8, c, w);
      break;
    }
    case "PESCADO": {
      strokeEllipse(page, cx - size * 0.06, cy, size * 0.29, size * 0.15, c, w);
      colorLine(page, x + size * 0.72, cy, x + size * 0.9, y + size * 0.68, c, w);
      colorLine(page, x + size * 0.72, cy, x + size * 0.9, y + size * 0.32, c, w);
      fillCircle(page, x + size * 0.36, y + size * 0.55, size * 0.025, c);
      break;
    }
    case "CARNES": {
      strokeEllipse(page, cx, cy, size * 0.34, size * 0.21, c, w);
      colorLine(page, x + size * 0.28, y + size * 0.42, x + size * 0.68, y + size * 0.62, c, w);
      colorLine(page, x + size * 0.3, y + size * 0.6, x + size * 0.66, y + size * 0.39, c, w);
      break;
    }
    case "BOCADILLOS": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG ${w} w ${(x + size * 0.18).toFixed(2)} ${(y + size * 0.46).toFixed(2)} m ${(x + size * 0.82).toFixed(2)} ${(y + size * 0.46).toFixed(2)} l ${(x + size * 0.72).toFixed(2)} ${(y + size * 0.67).toFixed(2)} ${(x + size * 0.28).toFixed(2)} ${(y + size * 0.67).toFixed(2)} ${(x + size * 0.18).toFixed(2)} ${(y + size * 0.46).toFixed(2)} c S Q`);
      colorLine(page, x + size * 0.22, y + size * 0.39, x + size * 0.78, y + size * 0.39, c, w);
      break;
    }
    case "POSTRES": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG ${w} w ${(x + size * 0.28).toFixed(2)} ${(y + size * 0.28).toFixed(2)} m ${(x + size * 0.7).toFixed(2)} ${(y + size * 0.28).toFixed(2)} l ${(x + size * 0.6).toFixed(2)} ${(y + size * 0.68).toFixed(2)} l ${(x + size * 0.36).toFixed(2)} ${(y + size * 0.68).toFixed(2)} l h S Q`);
      fillCircle(page, x + size * 0.5, y + size * 0.76, size * 0.045, c);
      break;
    }
    case "BEBIDAS": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG ${w} w ${(x + size * 0.26).toFixed(2)} ${(y + size * 0.24).toFixed(2)} ${(size * 0.25).toFixed(2)} ${(size * 0.5).toFixed(2)} re S Q`);
      colorLine(page, x + size * 0.57, y + size * 0.26, x + size * 0.73, y + size * 0.67, c, w);
      colorLine(page, x + size * 0.73, y + size * 0.67, x + size * 0.82, y + size * 0.25, c, w);
      break;
    }
    case "VINOS": {
      strokeEllipse(page, x + size * 0.39, y + size * 0.61, size * 0.18, size * 0.23, c, w);
      colorLine(page, x + size * 0.39, y + size * 0.38, x + size * 0.39, y + size * 0.2, c, w);
      colorLine(page, x + size * 0.24, y + size * 0.2, x + size * 0.54, y + size * 0.2, c, w);
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG ${w} w ${(x + size * 0.63).toFixed(2)} ${(y + size * 0.2).toFixed(2)} ${(size * 0.16).toFixed(2)} ${(size * 0.54).toFixed(2)} re S Q`);
      break;
    }
    case "CHACINA": {
      strokeEllipse(page, cx, cy, size * 0.34, size * 0.2, c, w);
      strokeEllipse(page, cx, cy, size * 0.21, size * 0.11, c, w);
      colorLine(page, x + size * 0.18, cy, x + size * 0.82, cy, c, w * 0.8);
      break;
    }
    case "LAND": {
      page.push(`q ${c[0]} ${c[1]} ${c[2]} RG ${w} w ${(x + size * 0.28).toFixed(2)} ${(y + size * 0.24).toFixed(2)} ${(size * 0.42).toFixed(2)} ${(size * 0.45).toFixed(2)} re S Q`);
      colorLine(page, x + size * 0.25, y + size * 0.72, x + size * 0.73, y + size * 0.72, c, w);
      fillEllipse(page, x + size * 0.4, y + size * 0.83, size * 0.08, size * 0.05, c);
      fillEllipse(page, x + size * 0.6, y + size * 0.82, size * 0.08, size * 0.05, c);
      break;
    }
    default: {
      strokeEllipse(page, cx, cy, size * 0.31, size * 0.2, c, w);
      colorLine(page, x + size * 0.27, y + size * 0.5, x + size * 0.73, y + size * 0.5, c, w);
    }
  }
}

function drawHeader(page: PdfPage) {
  image(page, MARGIN, PAGE_H - 91, 47, 47);
  text(page, MARGIN + 60, PAGE_H - 67, "VENTA EL BUJIO", 18, true, INK);
  line(page, MARGIN, PAGE_H - 103, PAGE_W - MARGIN, PAGE_H - 103, 0.72);
}

function drawCover(page: PdfPage, phone: string) {
  fillRect(page, 0, 0, PAGE_W, PAGE_H, [0, 0, 0]);
  // Bloque principal centrado verticalmente en la portada.
  image(page, (PAGE_W - 168) / 2, 430, 168, 168);
  centeredText(page, 402, "VENTA EL BUJIO", 15, true, [0.84, 0.64, 0.38]);
  centeredText(page, 362, "SABORES DE SIEMPRE", 27, true, [0.96, 0.92, 0.86]);
  centeredText(page, 328, "Cocina tradicional", 13, false, [0.84, 0.78, 0.7]);
  colorLine(page, 140, 295, PAGE_W - 140, 295, [0.42, 0.31, 0.23], 0.8);

  drawCategoryArtwork(page, "ENTRANTES", 164, 245, 34);
  drawCategoryArtwork(page, "PESCADO", 234, 245, 34);
  drawCategoryArtwork(page, "CARNES", 304, 245, 34);
  drawCategoryArtwork(page, "VINOS", 374, 245, 34);

  // La reserva aparece una única vez, al pie de la portada.
  centeredText(page, 52, "Para hacer reservas puede contactar al teléfono: " + phone, 9.3, true, [0.96, 0.92, 0.86]);
}

function drawFooter(page: PdfPage, pageNumber: number, _phone: string, withLegend = true, breadServiceText = "") {
  if (withLegend) {
    line(page, MARGIN, 112, PAGE_W - MARGIN, 112, 0.78);

    if (breadServiceText) {
      text(page, MARGIN, 100, `* ${breadServiceText}`, 6.2, true, MUTED);
    }
    text(page, MARGIN, 90, "* IVA incluido en los precios de la carta.", 6.2, true, MUTED);

    const cols = 7;
    const cellW = CONTENT_W / cols;
    ALLERGENS.forEach((allergen, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = MARGIN + col * cellW;
      const y = row === 0 ? 65 : 43;
      drawAllergenIcon(page, allergen.value, x, y - 3, 10, false);
      text(page, x + 12, y, LEGEND_LABELS[allergen.value] ?? allergen.value, 5.2, false, MUTED);
    });
  }

  centeredText(page, 17, String(pageNumber), 7.2, true, withLegend ? MUTED : [0.78, 0.69, 0.6]);
}

function drawCategory(page: PdfPage, y: number, label: string, category: string) {
  fillRect(page, MARGIN, y - CATEGORY_H + 4, CONTENT_W, CATEGORY_H - 4, INK);
  text(page, MARGIN + 10, y - 15, label.toUpperCase(), 9.5, true, EARTH_LIGHT);
  // Icono pequeño, completamente contenido dentro de la franja de categoría.
  drawCategoryArtwork(page, category, PAGE_W - MARGIN - 27, y - CATEGORY_H + 8, 16);
}

function menuItemHeight(item: MenuPdfItem) {
  const descriptionLines = item.description ? wrapText(item.description, 92, 2).length : 0;
  const ingredientLines = item.ingredients?.length ? wrapText(`Ingredientes: ${item.ingredients.join(", ")}`, 92, 2).length : 0;
  const validAllergens = item.allergens.filter((value) => ALLERGENS.some((a) => a.value === value));
  const allergenRows = validAllergens.length ? Math.ceil(validAllergens.length / 10) : 0;
  return Math.max(42, 25 + descriptionLines * 9 + ingredientLines * 9 + allergenRows * 17 + 8);
}

function drawMenuItem(page: PdfPage, y: number, item: MenuPdfItem) {
  const height = menuItemHeight(item);
  text(page, MARGIN + 4, y - 13, truncate(item.name, 44), 10, true);

  const prices = priceText(item);
  if (prices) {
    const approx = Math.min(245, cleanText(prices).length * 3.7);
    text(page, PAGE_W - MARGIN - approx, y - 13, truncate(prices, 72), 7.4, true, [0.34, 0.22, 0.14]);
  }

  let cursorY = y - 27;
  if (item.description) {
    for (const lineValue of wrapText(item.description, 92, 2)) {
      text(page, MARGIN + 4, cursorY, lineValue, 7.1, false, [0.41, 0.33, 0.27]);
      cursorY -= 9;
    }
  }

  if (item.ingredients?.length) {
    for (const lineValue of wrapText(`Ingredientes: ${item.ingredients.join(", ")}`, 92, 2)) {
      text(page, MARGIN + 4, cursorY, lineValue, 7.1, false, [0.31, 0.24, 0.19]);
      cursorY -= 9;
    }
  }

  const allergens = item.allergens.filter((value) => ALLERGENS.some((a) => a.value === value));
  if (allergens.length) {
    text(page, MARGIN + 4, cursorY - 1, "Alérgenos:", 6.3, true, MUTED);
    let iconX = MARGIN + 49;
    let iconY = cursorY - 6;
    allergens.forEach((allergen, index) => {
      if (index > 0 && index % 10 === 0) {
        iconX = MARGIN + 49;
        iconY -= 17;
      }
      drawAllergenIcon(page, allergen, iconX, iconY, 12, true);
      iconX += 16;
    });
  }

  line(page, MARGIN, y - height, PAGE_W - MARGIN, y - height, 0.88);
  return height;
}

function drawLandItem(page: PdfPage, y: number, item: LandPdfItem) {
  text(page, MARGIN + 4, y - 13, truncate(item.name, 52), 10, true);
  if (item.priceCents != null) text(page, PAGE_W - MARGIN - 72, y - 13, `${price(item.priceCents)}`, 7.8, true, [0.34, 0.22, 0.14]);
  if (item.description) text(page, MARGIN + 4, y - 29, truncate(item.description, 90), 7.2, false, [0.41, 0.33, 0.27]);
  line(page, MARGIN, y - LAND_ITEM_H, PAGE_W - MARGIN, y - LAND_ITEM_H, 0.88);
}

function buildPdf(objects: PdfObject[]) {
  const header = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1");
  const chunks: Buffer[] = [header];
  const offsets: number[] = [0];
  let size = header.length;

  objects.forEach((body, index) => {
    offsets[index + 1] = size;
    const prefix = Buffer.from(`${index + 1} 0 obj\n`, "latin1");
    const content = Buffer.isBuffer(body) ? body : Buffer.from(body, "latin1");
    const suffix = Buffer.from("\nendobj\n", "latin1");
    chunks.push(prefix, content, suffix);
    size += prefix.length + content.length + suffix.length;
  });

  const xrefOffset = size;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  const trailer = `${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(trailer, "latin1"));
  return Buffer.concat(chunks);
}

export function createMenuPdf(
  items: MenuPdfItem[],
  landProducts: LandPdfItem[],
  options: { phone?: string; breadServiceText?: string | null } = {},
) {
  const phone = cleanText(options.phone || "956 71 60 77");
  const breadServiceText = cleanText(options.breadServiceText || "");
  const pages: PdfPage[] = [];
  let page: PdfPage = [];
  let y = TOP;

  // Portada independiente.
  const cover: PdfPage = [];
  drawCover(cover, phone);
  pages.push(cover);

  const startPage = () => {
    page = [];
    drawHeader(page);
    y = TOP;
  };
  const endPage = () => {
    pages.push(page);
  };
  const newPage = () => {
    endPage();
    startPage();
  };
  const available = () => y - BOTTOM;
  const pageCapacity = TOP - BOTTOM;
  const isFreshPage = () => Math.abs(y - TOP) < 0.01;

  startPage();

  for (const category of CATEGORY_ORDER) {
    const group = items.filter((item) => item.category === category);
    if (!group.length) continue;

    const label = categoryLabel(category);
    const totalCategoryHeight = CATEGORY_H + group.reduce((sum, item) => sum + menuItemHeight(item), 0) + 8;

    // Si la categoría completa cabe en una hoja, nunca se parte entre dos.
    if (totalCategoryHeight <= pageCapacity && available() < totalCategoryHeight) {
      newPage();
    } else if (totalCategoryHeight > pageCapacity && !isFreshPage()) {
      // Las categorías muy largas empiezan siempre en hoja nueva para evitar dejar solo uno o dos productos al final.
      newPage();
    }

    drawCategory(page, y, label, category);
    y -= CATEGORY_H;

    for (const item of group) {
      const height = menuItemHeight(item);
      if (available() < height) {
        newPage();
        // Si una categoría es demasiado larga para una sola hoja, repetimos únicamente su título, sin "continuación".
        drawCategory(page, y, label, category);
        y -= CATEGORY_H;
      }
      y -= drawMenuItem(page, y, item);
    }
    y -= 8;
  }

  if (landProducts.length) {
    const totalLandHeight = CATEGORY_H + landProducts.length * LAND_ITEM_H + 8;
    if (totalLandHeight <= pageCapacity && available() < totalLandHeight) {
      newPage();
    } else if (totalLandHeight > pageCapacity && !isFreshPage()) {
      newPage();
    }

    drawCategory(page, y, "Productos de la tierra", "LAND");
    y -= CATEGORY_H;

    for (const item of landProducts) {
      if (available() < LAND_ITEM_H) {
        newPage();
        drawCategory(page, y, "Productos de la tierra", "LAND");
        y -= CATEGORY_H;
      }
      drawLandItem(page, y, item);
      y -= LAND_ITEM_H;
    }
  }

  endPage();
  pages.forEach((pageCommands, index) => drawFooter(pageCommands, index + 1, phone, index > 0, breadServiceText));

  const logo = Buffer.from(PDF_LOGO_JPEG_BASE64, "base64");

  const objects: PdfObject[] = [];
  const pageObjectNumbers = pages.map((_, index) => 6 + index * 2);
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(" ")}] >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  objects.push(Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width 900 /Height 900 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.length} >>\nstream\n`, "latin1"),
    logo,
    Buffer.from("\nendstream", "latin1"),
  ]));

  pages.forEach((commands, index) => {
    const pageObj = 6 + index * 2;
    const contentObj = pageObj + 1;
    const stream = commands.join("\n");
    const streamBytes = Buffer.byteLength(stream, "latin1");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Logo 5 0 R >> >> /Contents ${contentObj} 0 R >>`);
    objects.push(`<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`);
  });

  return buildPdf(objects);
}
