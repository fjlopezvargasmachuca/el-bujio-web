import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createMenuPdf } from "@/lib/menuPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function formatPrice(cents: number | null | undefined) {
  if (cents == null) return null;
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return new Response("No autorizado", { status: 401 });

  const [items, landProducts, settings] = await Promise.all([
    prisma.menuItem.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: ({
        name: true,
        category: true,
        description: true,
        ingredients: true,
        allergens: true,
        priceTapaCents: true,
        priceMediaCents: true,
        pricePlatoCents: true,
        priceUnidadCents: true,
        priceCanaCents: true,
        priceCortadaCents: true,
        priceTercioCents: true,
        priceBotellaPequenaCents: true,
        priceBotellaGrandeCents: true,
        priceCopaCents: true,
        priceBotellaCents: true,
        price100gCents: true,
        priceCuartoKgCents: true,
        priceKiloCents: true,
      } as any),
    }),
    (prisma as any).landProduct.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { name: true, description: true, priceCents: true },
    }),
    prisma.siteSettings.findUnique({
      where: { id: 1 },
      select: ({ phone: true, menuBreadPriceCents: true, menuBreadPublished: true } as any),
    }),
  ]);

  const breadServiceText = settings?.menuBreadPublished ? `Servicio de pan/picos: ${formatPrice(settings.menuBreadPriceCents)}` : null;

  const pdf = createMenuPdf(items as any, landProducts as any, {
    phone: settings?.phone ?? "956 71 60 77",
    breadServiceText,
  });

  return new Response(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="carta-el-bujio.pdf"',
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
