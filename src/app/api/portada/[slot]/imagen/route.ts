import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slot: string }> }) {
  const { slot } = await params;
  if (slot !== "1" && slot !== "2") return new Response("Imagen no disponible", { status: 404 });

  const settings = (await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: slot === "1"
      ? ({ homeImage1Data: true, homeImage1Mime: true } as any)
      : ({ homeImage2Data: true, homeImage2Mime: true } as any),
  })) as any;

  const imageData = slot === "1" ? settings?.homeImage1Data : settings?.homeImage2Data;
  const imageMime = slot === "1" ? settings?.homeImage1Mime : settings?.homeImage2Mime;

  if (!imageData || !imageMime) return new Response("Imagen no disponible", { status: 404 });

  const bytes = Buffer.from(imageData, "base64");
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": imageMime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
