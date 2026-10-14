import { ALLERGENS } from "./allergens";
import { categoryLabel } from "./format";

type AllergenPdfItem = {
  name: string;
  category: string;
  allergens: string[];
};

type PdfPage = string[];

const PAGE_W = 841.89;
const PAGE_H = 595.28;
const MARGIN = 28;
const DISH_W = 184;
const HEADER_H = 74;
const ROW_H = 16;
const TABLE_TOP = 512;
const TABLE_BOTTOM = 46;
const COL_W = (PAGE_W - MARGIN * 2 - DISH_W) / ALLERGENS.length;

function cleanText(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/“|”/g, '"')
    .replace(/’/g, "'")
    .replace(/€/g, "EUR");
}

function pdfEscape(value: string) {
  return cleanText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function text(
  page: PdfPage,
  x: number,
  y: number,
  value: string,
  size = 9,
  bold = false,
  color: [number, number, number] = [0.14, 0.19, 0.23],
) {
  page.push(`${color[0]} ${color[1]} ${color[2]} rg BT /${bold ? "F2" : "F1"} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(value)}) Tj ET`);
}

function line(page: PdfPage, x1: number, y1: number, x2: number, y2: number, gray = 0.82) {
  page.push(`${gray} G 0.5 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
}

function fillRect(page: PdfPage, x: number, y: number, w: number, h: number, r: number, g: number, b: number) {
  page.push(`${r} ${g} ${b} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
}

function centeredText(page: PdfPage, x: number, y: number, width: number, value: string, size = 7, bold = false) {
  const approximate = cleanText(value).length * size * 0.48;
  text(page, x + Math.max(2, (width - approximate) / 2), y, value, size, bold);
}

function headerLines(label: string) {
  const normalized = cleanText(label);
  if (normalized === "Frutos de cáscara") return ["Frutos de", "cáscara"];
  if (normalized === "Crustáceos") return ["Crustáceos"];
  if (normalized === "Cacahuetes") return ["Cacahuetes"];
  if (normalized === "Altramuces") return ["Altramuces"];
  if (normalized.length > 11) {
    const words = normalized.split(" ");
    if (words.length > 1) {
      const pivot = Math.ceil(words.length / 2);
      return [words.slice(0, pivot).join(" "), words.slice(pivot).join(" ")];
    }
  }
  return [normalized];
}

function drawTableHeader(page: PdfPage) {
  text(page, MARGIN, 560, "Carta de alérgenos - Venta El Bujio", 15, true);
  text(page, MARGIN, 544, "Una X indica que el plato tiene registrado ese alérgeno.", 8, false);

  const y = TABLE_TOP - HEADER_H;
  fillRect(page, MARGIN, y, PAGE_W - MARGIN * 2, HEADER_H, 0.95, 0.92, 0.87);
  line(page, MARGIN, TABLE_TOP, PAGE_W - MARGIN, TABLE_TOP, 0.65);
  line(page, MARGIN, y, PAGE_W - MARGIN, y, 0.65);

  text(page, MARGIN + 7, y + 31, "Plato", 8, true);
  let x = MARGIN + DISH_W;
  for (const allergen of ALLERGENS) {
    line(page, x, y, x, TABLE_TOP, 0.74);
    const lines = headerLines(allergen.value);
    if (lines.length === 1) {
      centeredText(page, x, y + 31, COL_W, lines[0], 5.6, true);
    } else {
      centeredText(page, x, y + 36, COL_W, lines[0], 5.2, true);
      centeredText(page, x, y + 25, COL_W, lines[1], 5.2, true);
    }
    x += COL_W;
  }
  line(page, PAGE_W - MARGIN, y, PAGE_W - MARGIN, TABLE_TOP, 0.74);
}

function drawCategoryRow(page: PdfPage, y: number, label: string) {
  fillRect(page, MARGIN, y - ROW_H, PAGE_W - MARGIN * 2, ROW_H, 0.25, 0.35, 0.29);
  text(page, MARGIN + 7, y - 11.5, label.toUpperCase(), 7.3, true, [1, 1, 1]);
}

function drawDishRow(page: PdfPage, y: number, item: AllergenPdfItem) {
  line(page, MARGIN, y - ROW_H, PAGE_W - MARGIN, y - ROW_H, 0.87);
  text(page, MARGIN + 6, y - 11.5, item.name.slice(0, 42), 7.2, false);
  const set = new Set(item.allergens);
  let x = MARGIN + DISH_W;
  for (const allergen of ALLERGENS) {
    line(page, x, y - ROW_H, x, y, 0.9);
    if (set.has(allergen.value)) {
      centeredText(page, x, y - 11.5, COL_W, "X", 8, true);
    }
    x += COL_W;
  }
  line(page, PAGE_W - MARGIN, y - ROW_H, PAGE_W - MARGIN, y, 0.9);
}

function makePdf(objects: string[]) {
  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%âãÏÓ\n", "latin1")];
  const offsets: number[] = [0];
  let size = chunks[0].length;

  objects.forEach((body, index) => {
    offsets[index + 1] = size;
    const obj = Buffer.from(`${index + 1} 0 obj\n${body}\nendobj\n`, "latin1");
    chunks.push(obj);
    size += obj.length;
  });

  const xrefOffset = size;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  chunks.push(Buffer.from(trailer, "latin1"));
  return Buffer.concat(chunks);
}

export function createAllergenPdf(items: AllergenPdfItem[]) {
  const categoryOrder = ["ENTRANTES", "CHACINA", "PESCADO", "CARNES", "BOCADILLOS", "POSTRES", "BEBIDAS", "VINOS", "OTROS"];
  const rows: Array<{ kind: "category"; label: string } | { kind: "dish"; item: AllergenPdfItem }> = [];

  for (const category of categoryOrder) {
    const group = items.filter((item) => item.category === category);
    if (!group.length) continue;
    rows.push({ kind: "category", label: categoryLabel(category) });
    group.forEach((item) => rows.push({ kind: "dish", item }));
  }

  const pages: PdfPage[] = [];
  let page: PdfPage = [];
  let y = TABLE_TOP - HEADER_H;
  let pageNumber = 1;
  drawTableHeader(page);

  for (const row of rows) {
    if (y - ROW_H < TABLE_BOTTOM) {
      text(page, MARGIN, 28, "Ante alergias o intolerancias, consulta siempre con el personal antes de pedir.", 7, false);
      centeredText(page, 0, 11, PAGE_W, String(pageNumber), 7.2, true);
      pages.push(page);
      page = [];
      pageNumber += 1;
      drawTableHeader(page);
      y = TABLE_TOP - HEADER_H;
    }
    if (row.kind === "category") drawCategoryRow(page, y, row.label);
    else drawDishRow(page, y, row.item);
    y -= ROW_H;
  }

  text(page, MARGIN, 28, "Ante alergias o intolerancias, consulta siempre con el personal antes de pedir.", 7, false);
  centeredText(page, 0, 11, PAGE_W, String(pageNumber), 7.2, true);
  pages.push(page);

  // Object layout: 1 catalog, 2 pages tree, 3 font regular, 4 font bold, then page/content pairs.
  const objects: string[] = [];
  const pageObjectNumbers = pages.map((_, index) => 5 + index * 2);
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectNumbers.map((n) => `${n} 0 R`).join(" ")}] >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  pages.forEach((commands, index) => {
    const pageObj = 5 + index * 2;
    const contentObj = pageObj + 1;
    const stream = commands.join("\n");
    const streamBytes = Buffer.byteLength(stream, "latin1");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`);
    objects.push(`<< /Length ${streamBytes} >>\nstream\n${stream}\nendstream`);
  });

  return makePdf(objects);
}
