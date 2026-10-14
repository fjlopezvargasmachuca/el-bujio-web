import { ALLERGENS } from "./allergens";
import { categoryLabel, menuPricePairs, type MenuPriceRecord } from "./format";
import { PDF_LOGO_JPEG_BASE64 } from "./pdfLogo";

type MenuPdfItem = MenuPriceRecord & {
  name: string;
  category: string;
  description?: string | null;
  allergens: string[];
};

type LandPdfItem = {
  name: string;
  description?: string | null;
  priceCents?: number | null;
};

type PdfPage = string[];
type PdfObject = string | Buffer;

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 42;
const CONTENT_W = PAGE_W - MARGIN * 2;
const TOP = 744;
const BOTTOM = 62;
const CATEGORY_H = 27;
const ITEM_H = 45;

const CATEGORY_ORDER = ["ENTRANTES", "CHACINA", "PESCADO", "CARNES", "BOCADILLOS", "POSTRES", "BEBIDAS", "VINOS", "OTROS"];

const ALLERGEN_CODES: Record<string, string> = {
  Gluten: "GL",
  "Crustáceos": "CR",
  Huevos: "HU",
  Pescado: "PE",
  Cacahuetes: "CA",
  Soja: "SO",
  Leche: "LE",
  "Frutos de cáscara": "FC",
  Apio: "AP",
  Mostaza: "MO",
  "Sésamo": "SE",
  Sulfitos: "SU",
  Altramuces: "AL",
  Moluscos: "ML",
};

function cleanText(value: string) {
  return String(value ?? "")
    .replace(/[–—]/g, "-")
    .replace(/“|”/g, '"')
    .replace(/’/g, "'")
    .replace(/€/g, "EUR")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value: string) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function text(page: PdfPage, x: number, y: number, value: string, size = 9, bold = false, color: [number, number, number] = [0.12, 0.09, 0.07]) {
  page.push(`${color[0]} ${color[1]} ${color[2]} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(value)}) Tj ET`);
}

function fillRect(page: PdfPage, x: number, y: number, w: number, h: number, rgb: [number, number, number]) {
  page.push(`${rgb[0]} ${rgb[1]} ${rgb[2]} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
}

function line(page: PdfPage, x1: number, y1: number, x2: number, y2: number, gray = 0.8) {
  page.push(`${gray} G 0.55 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function image(page: PdfPage, x: number, y: number, w: number, h: number) {
  page.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Logo Do Q`);
}

function price(cents?: number | null) {
  if (cents == null) return null;
  return `${(cents / 100).toFixed(2).replace(".", ",")} EUR`;
}

function priceText(item: MenuPdfItem) {
  return menuPricePairs(item)
    .filter(([, value]) => value != null)
    .map(([label, value]) => `${label} ${price(value)}`)
    .join(" · ");
}

function truncate(value: string, max: number) {
  const clean = cleanText(value);
  return clean.length <= max ? clean : `${clean.slice(0, Math.max(0, max - 3))}...`;
}

function drawBadge(page: PdfPage, x: number, y: number, code: string) {
  fillRect(page, x, y, 18, 13, [0.47, 0.31, 0.2]);
  text(page, x + 3.1, y + 3.2, code, 6.3, true, [1, 0.97, 0.92]);
}

function drawHeader(page: PdfPage, pageNumber: number) {
  image(page, MARGIN, PAGE_H - 91, 47, 47);
  text(page, MARGIN + 60, PAGE_H - 60, "VENTA EL BUJIO", 18, true, [0.11, 0.09, 0.07]);
  text(page, MARGIN + 60, PAGE_H - 78, "Carta actualizada", 9.5, false, [0.38, 0.29, 0.22]);
  text(page, PAGE_W - MARGIN - 55, PAGE_H - 60, `Pag. ${pageNumber}`, 7.5, false, [0.38, 0.29, 0.22]);
  line(page, MARGIN, PAGE_H - 103, PAGE_W - MARGIN, PAGE_H - 103, 0.72);
}

function drawFooter(page: PdfPage) {
  line(page, MARGIN, 42, PAGE_W - MARGIN, 42, 0.78);
  text(page, MARGIN, 28, "Precios e información sujetos a disponibilidad. Ante alergias, consulta con el personal.", 7.2, false, [0.4, 0.31, 0.24]);
}

function drawCategory(page: PdfPage, y: number, label: string) {
  fillRect(page, MARGIN, y - CATEGORY_H + 4, CONTENT_W, CATEGORY_H - 4, [0.12, 0.09, 0.07]);
  text(page, MARGIN + 10, y - 14, label.toUpperCase(), 9.5, true, [0.92, 0.82, 0.67]);
}

function drawMenuItem(page: PdfPage, y: number, item: MenuPdfItem) {
  text(page, MARGIN + 4, y - 13, truncate(item.name, 48), 10, true);
  const prices = priceText(item);
  if (prices) {
    const approx = Math.min(245, cleanText(prices).length * 4.2);
    text(page, PAGE_W - MARGIN - approx, y - 13, truncate(prices, 72), 7.6, true, [0.34, 0.22, 0.14]);
  }
  if (item.description) text(page, MARGIN + 4, y - 28, truncate(item.description, 82), 7.2, false, [0.41, 0.33, 0.27]);

  let badgeX = MARGIN + 4;
  const badgeY = y - 43;
  for (const allergen of item.allergens) {
    const code = ALLERGEN_CODES[allergen];
    if (!code) continue;
    drawBadge(page, badgeX, badgeY, code);
    badgeX += 21;
  }
  line(page, MARGIN, y - ITEM_H, PAGE_W - MARGIN, y - ITEM_H, 0.88);
}

function drawLandItem(page: PdfPage, y: number, item: LandPdfItem) {
  text(page, MARGIN + 4, y - 13, truncate(item.name, 52), 10, true);
  if (item.priceCents != null) text(page, PAGE_W - MARGIN - 92, y - 13, `Unidad ${price(item.priceCents)}`, 7.8, true, [0.34, 0.22, 0.14]);
  if (item.description) text(page, MARGIN + 4, y - 29, truncate(item.description, 90), 7.2, false, [0.41, 0.33, 0.27]);
  line(page, MARGIN, y - ITEM_H, PAGE_W - MARGIN, y - ITEM_H, 0.88);
}

function drawLegend(page: PdfPage, y: number) {
  text(page, MARGIN, y, "Iconos de alérgenos", 8.5, true, [0.34, 0.22, 0.14]);
  let x = MARGIN;
  let rowY = y - 19;
  for (const allergen of ALLERGENS) {
    const code = ALLERGEN_CODES[allergen.value];
    if (x > PAGE_W - MARGIN - 94) {
      x = MARGIN;
      rowY -= 19;
    }
    drawBadge(page, x, rowY - 2, code);
    text(page, x + 22, rowY + 1, truncate(allergen.value, 16), 6.2, false, [0.36, 0.28, 0.22]);
    x += 96;
  }
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

export function createMenuPdf(items: MenuPdfItem[], landProducts: LandPdfItem[]) {
  const pages: PdfPage[] = [];
  let page: PdfPage = [];
  let pageNumber = 1;
  let y = TOP;

  const startPage = () => {
    page = [];
    drawHeader(page, pageNumber);
    y = TOP;
  };
  const endPage = () => {
    drawFooter(page);
    pages.push(page);
    pageNumber += 1;
  };
  const ensureSpace = (height: number) => {
    if (y - height < BOTTOM) {
      endPage();
      startPage();
    }
  };

  startPage();
  drawLegend(page, y);
  y -= 74;

  for (const category of CATEGORY_ORDER) {
    const group = items.filter((item) => item.category === category);
    if (!group.length) continue;
    ensureSpace(CATEGORY_H + ITEM_H);
    drawCategory(page, y, categoryLabel(category));
    y -= CATEGORY_H;
    for (const item of group) {
      ensureSpace(ITEM_H);
      drawMenuItem(page, y, item);
      y -= ITEM_H;
    }
    y -= 8;
  }

  if (landProducts.length) {
    ensureSpace(CATEGORY_H + ITEM_H);
    drawCategory(page, y, "Productos de la tierra");
    y -= CATEGORY_H;
    for (const item of landProducts) {
      ensureSpace(ITEM_H);
      drawLandItem(page, y, item);
      y -= ITEM_H;
    }
  }
  endPage();

  const logo = Buffer.from(PDF_LOGO_JPEG_BASE64, "base64");

  // Objetos: 1 catálogo, 2 árbol de páginas, 3 fuente normal, 4 fuente negrita, 5 logo JPEG, después pares página/contenido.
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
