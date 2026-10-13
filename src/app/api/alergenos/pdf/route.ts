import { prisma } from "@/lib/db";
import { createAllergenPdf } from "@/lib/allergenPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: { name: true, category: true, allergens: true },
  });

  const pdf = createAllergenPdf(items);
  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="carta-alergenos-el-bujio.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
