import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.specialItem.findUnique({
    where: { id },
    select: ({ imageData: true, imageMime: true } as any),
  }) as any;

  if (!item?.imageData || !item?.imageMime) {
    return new Response("Imagen no disponible", { status: 404 });
  }

  const bytes = Buffer.from(item.imageData, "base64");
  return new Response(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": item.imageMime,
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
