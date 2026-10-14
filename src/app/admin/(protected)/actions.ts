"use server";

import { MenuCategory, SpecialType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseEuroToCents, splitCsv } from "@/lib/format";
import { sanitizeAllergens } from "@/lib/allergens";

function str(formData: FormData, key: string, max = 2000) {
  return String(formData.get(key) ?? "").trim().slice(0, max);
}

function requiredName(formData: FormData) {
  const value = str(formData, "name", 120);
  if (!value) throw new Error("El nombre es obligatorio.");
  return value;
}

function menuSection(value: string) {
  return ["Primeros", "Segundos", "Postres"].includes(value) ? value : null;
}


function safeHttpUrl(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function menuCategory(value: string) {
  return Object.values(MenuCategory).includes(value as MenuCategory) ? (value as MenuCategory) : MenuCategory.OTROS;
}


const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 1_500_000;

async function readMenuImage(formData: FormData, current?: { imageData: string | null; imageMime: string | null }) {
  if (formData.get("removeImage") === "on") return { imageData: null, imageMime: null, error: null as string | null };

  const candidate = formData.get("image");
  if (!(candidate instanceof File) || candidate.size === 0) {
    return {
      imageData: current?.imageData ?? null,
      imageMime: current?.imageMime ?? null,
      error: null as string | null,
    };
  }

  if (candidate.size > MAX_IMAGE_BYTES) {
    return { imageData: current?.imageData ?? null, imageMime: current?.imageMime ?? null, error: "size" };
  }

  const buffer = Buffer.from(await candidate.arrayBuffer());
  let detectedMime: string | null = null;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) detectedMime = "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) detectedMime = "image/png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") detectedMime = "image/webp";

  if (!detectedMime || !ALLOWED_IMAGE_TYPES.has(detectedMime)) {
    return { imageData: current?.imageData ?? null, imageMime: current?.imageMime ?? null, error: "format" };
  }

  return { imageData: buffer.toString("base64"), imageMime: detectedMime, error: null as string | null };
}

async function readSiteImage(
  formData: FormData,
  inputName: string,
  removeName: string,
  current?: { imageData: string | null; imageMime: string | null },
) {
  if (formData.get(removeName) === "on") return { imageData: null, imageMime: null, error: null as string | null };

  const candidate = formData.get(inputName);
  if (!(candidate instanceof File) || candidate.size === 0) {
    return {
      imageData: current?.imageData ?? null,
      imageMime: current?.imageMime ?? null,
      error: null as string | null,
    };
  }

  if (candidate.size > MAX_IMAGE_BYTES) {
    return { imageData: current?.imageData ?? null, imageMime: current?.imageMime ?? null, error: "size" };
  }

  const buffer = Buffer.from(await candidate.arrayBuffer());
  let detectedMime: string | null = null;
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) detectedMime = "image/jpeg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) detectedMime = "image/png";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") detectedMime = "image/webp";

  if (!detectedMime || !ALLOWED_IMAGE_TYPES.has(detectedMime)) {
    return { imageData: current?.imageData ?? null, imageMime: current?.imageMime ?? null, error: "format" };
  }

  return { imageData: buffer.toString("base64"), imageMime: detectedMime, error: null as string | null };
}

function specialType(value: string) {
  return value === SpecialType.OFERTA ? SpecialType.OFERTA : SpecialType.MENU_DIA;
}

async function nextMenuSortOrder() {
  const result = await prisma.menuItem.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? -1) + 1;
}

async function nextSpecialSortOrder(type: SpecialType) {
  const result = await prisma.specialItem.aggregate({ where: { type }, _max: { sortOrder: true } });
  return (result._max.sortOrder ?? -1) + 1;
}

async function nextLandProductSortOrder() {
  const result = await (prisma as any).landProduct.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? -1) + 1;
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createMenuItem(formData: FormData) {
  await requireAdmin();
  const image = await readMenuImage(formData);
  if (image.error) redirect(`/admin/carta?status=image_${image.error}`);
  await prisma.menuItem.create({
    data: ({
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      category: menuCategory(str(formData, "category")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      priceTapaCents: parseEuroToCents(formData.get("priceTapa")),
      priceMediaCents: parseEuroToCents(formData.get("priceMedia")),
      pricePlatoCents: parseEuroToCents(formData.get("pricePlato")),
      priceUnidadCents: parseEuroToCents(formData.get("priceUnidad")),
      priceCanaCents: parseEuroToCents(formData.get("priceCana")),
      priceCortadaCents: parseEuroToCents(formData.get("priceCortada")),
      priceTercioCents: parseEuroToCents(formData.get("priceTercio")),
      priceBotellaPequenaCents: parseEuroToCents(formData.get("priceBotellaPequena")),
      priceBotellaGrandeCents: parseEuroToCents(formData.get("priceBotellaGrande")),
      priceCopaCents: parseEuroToCents(formData.get("priceCopa")),
      priceBotellaCents: parseEuroToCents(formData.get("priceBotella")),
      price100gCents: parseEuroToCents(formData.get("price100g")),
      priceCuartoKgCents: parseEuroToCents(formData.get("priceCuartoKg")),
      priceKiloCents: parseEuroToCents(formData.get("priceKilo")),
      imageData: image.imageData,
      imageMime: image.imageMime,
      active: formData.get("active") === "on",
      sortOrder: await nextMenuSortOrder(),
    }) as any,
  });
  revalidatePath("/");
  revalidatePath("/carta");
  revalidatePath("/admin");
  revalidatePath("/admin/carta");
  redirect("/admin/carta?status=created");
}

export async function updateMenuItem(id: string, formData: FormData) {
  await requireAdmin();
  const current = await prisma.menuItem.findUnique({ where: { id } }) as any;
  if (!current) return;
  const image = await readMenuImage(formData, current);
  if (image.error) redirect(`/admin/carta?status=image_${image.error}`);
  await prisma.menuItem.update({
    where: { id },
    data: ({
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      category: menuCategory(str(formData, "category")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      priceTapaCents: parseEuroToCents(formData.get("priceTapa")),
      priceMediaCents: parseEuroToCents(formData.get("priceMedia")),
      pricePlatoCents: parseEuroToCents(formData.get("pricePlato")),
      priceUnidadCents: parseEuroToCents(formData.get("priceUnidad")),
      priceCanaCents: parseEuroToCents(formData.get("priceCana")),
      priceCortadaCents: parseEuroToCents(formData.get("priceCortada")),
      priceTercioCents: parseEuroToCents(formData.get("priceTercio")),
      priceBotellaPequenaCents: parseEuroToCents(formData.get("priceBotellaPequena")),
      priceBotellaGrandeCents: parseEuroToCents(formData.get("priceBotellaGrande")),
      priceCopaCents: parseEuroToCents(formData.get("priceCopa")),
      priceBotellaCents: parseEuroToCents(formData.get("priceBotella")),
      price100gCents: parseEuroToCents(formData.get("price100g")),
      priceCuartoKgCents: parseEuroToCents(formData.get("priceCuartoKg")),
      priceKiloCents: parseEuroToCents(formData.get("priceKilo")),
      imageData: image.imageData,
      imageMime: image.imageMime,
      active: formData.get("active") === "on",
    }) as any,
  });
  revalidatePath("/");
  revalidatePath("/carta");
  revalidatePath("/admin");
  revalidatePath("/admin/carta");
  redirect("/admin/carta?status=saved");
}

export async function deleteMenuItem(id: string) {
  await requireAdmin();
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/carta");
  revalidatePath("/admin");
  revalidatePath("/admin/carta");
  redirect("/admin/carta?status=deleted");
}

export async function reorderMenuItems(ids: string[]) {
  await requireAdmin();
  if (!Array.isArray(ids) || !ids.length) return;
  await prisma.$transaction(
    ids.map((id, index) => prisma.menuItem.update({ where: { id }, data: { sortOrder: index } })),
  );
  revalidatePath("/carta");
  revalidatePath("/admin/carta");
}

export async function createLandProduct(formData: FormData) {
  await requireAdmin();
  const image = await readMenuImage(formData);
  if (image.error) redirect(`/admin/productos-tierra?status=image_${image.error}`);
  await (prisma as any).landProduct.create({
    data: {
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      priceCents: parseEuroToCents(formData.get("price")),
      imageData: image.imageData,
      imageMime: image.imageMime,
      active: formData.get("active") === "on",
      sortOrder: await nextLandProductSortOrder(),
    },
  });
  revalidatePath("/");
  revalidatePath("/productos-de-la-tierra");
  revalidatePath("/admin");
  revalidatePath("/admin/productos-tierra");
  redirect("/admin/productos-tierra?status=created");
}

export async function updateLandProduct(id: string, formData: FormData) {
  await requireAdmin();
  const current = await (prisma as any).landProduct.findUnique({ where: { id } });
  if (!current) return;
  const image = await readMenuImage(formData, current);
  if (image.error) redirect(`/admin/productos-tierra?status=image_${image.error}`);
  await (prisma as any).landProduct.update({
    where: { id },
    data: {
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      priceCents: parseEuroToCents(formData.get("price")),
      imageData: image.imageData,
      imageMime: image.imageMime,
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/");
  revalidatePath("/productos-de-la-tierra");
  revalidatePath("/admin");
  revalidatePath("/admin/productos-tierra");
  redirect("/admin/productos-tierra?status=saved");
}

export async function deleteLandProduct(id: string) {
  await requireAdmin();
  await (prisma as any).landProduct.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/productos-de-la-tierra");
  revalidatePath("/admin");
  revalidatePath("/admin/productos-tierra");
  redirect("/admin/productos-tierra?status=deleted");
}

export async function reorderLandProducts(ids: string[]) {
  await requireAdmin();
  if (!Array.isArray(ids) || !ids.length) return;
  await prisma.$transaction(ids.map((id, index) => (prisma as any).landProduct.update({ where: { id }, data: { sortOrder: index } })));
  revalidatePath("/productos-de-la-tierra");
  revalidatePath("/admin/productos-tierra");
}

export async function createSpecialItem(formData: FormData) {
  await requireAdmin();
  const type = specialType(str(formData, "type"));
  const image = await readMenuImage(formData);
  if (image.error) redirect("/admin/especiales?status=image_" + image.error);
  await prisma.specialItem.create({
    data: ({
      type,
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      section: type === SpecialType.MENU_DIA ? menuSection(str(formData, "section", 40)) : null,
      priceCents: type === SpecialType.MENU_DIA ? null : parseEuroToCents(formData.get("price")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      imageData: image.imageData,
      imageMime: image.imageMime,
      active: formData.get("active") === "on",
      sortOrder: await nextSpecialSortOrder(type),
    }) as any,
  });
  revalidatePath(type === SpecialType.OFERTA ? "/ofertas" : "/menu-del-dia");
  revalidatePath("/admin");
  revalidatePath("/admin/especiales");
  redirect("/admin/especiales?status=created");
}

export async function updateSpecialItem(id: string, formData: FormData) {
  await requireAdmin();
  const current = await prisma.specialItem.findUnique({ where: { id } }) as any;
  if (!current) return;
  const type = specialType(str(formData, "type"));
  const typeChanged = current.type !== type;
  const image = await readMenuImage(formData, current);
  if (image.error) redirect("/admin/especiales?status=image_" + image.error);
  await prisma.specialItem.update({
    where: { id },
    data: ({
      type,
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      section: type === SpecialType.MENU_DIA ? menuSection(str(formData, "section", 40)) : null,
      priceCents: type === SpecialType.MENU_DIA ? null : parseEuroToCents(formData.get("price")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      imageData: image.imageData,
      imageMime: image.imageMime,
      active: formData.get("active") === "on",
      ...(typeChanged ? { sortOrder: await nextSpecialSortOrder(type) } : {}),
    }) as any,
  });
  revalidatePath("/menu-del-dia");
  revalidatePath("/ofertas");
  revalidatePath("/admin");
  revalidatePath("/admin/especiales");
  redirect("/admin/especiales?status=saved");
}

export async function deleteSpecialItem(id: string) {
  await requireAdmin();
  await prisma.specialItem.delete({ where: { id } });
  revalidatePath("/menu-del-dia");
  revalidatePath("/ofertas");
  revalidatePath("/admin");
  revalidatePath("/admin/especiales");
  redirect("/admin/especiales?status=deleted");
}

export async function reorderSpecialItems(ids: string[]) {
  await requireAdmin();
  if (!Array.isArray(ids) || !ids.length) return;
  await prisma.$transaction(
    ids.map((id, index) => prisma.specialItem.update({ where: { id }, data: { sortOrder: index } })),
  );
  revalidatePath("/menu-del-dia");
  revalidatePath("/ofertas");
  revalidatePath("/admin/especiales");
}

export async function updateMenuDayPrice(formData: FormData) {
  await requireAdmin();
  const price = parseEuroToCents(formData.get("menuDayPrice"));
  const breadPrice = parseEuroToCents(formData.get("menuBreadPrice"));
  const menuBreadPublished = formData.get("menuBreadPublished") === "on" && breadPrice != null;
  const redirectTo = str(formData, "redirectTo", 120) || "/admin/especiales";
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: ({ id: 1, menuDayPriceCents: price, menuBreadPriceCents: breadPrice, menuBreadPublished, reservationEnabled: false } as any),
    update: ({ menuDayPriceCents: price, menuBreadPriceCents: breadPrice, menuBreadPublished } as any),
  });
  revalidatePath("/menu-del-dia");
  revalidatePath("/carta");
  revalidatePath("/admin/carta");
  revalidatePath("/admin/especiales");
  redirect(`${redirectTo}?status=price`);
}

export async function updateContact(formData: FormData) {
  await requireAdmin();
  const current = (await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: ({
      homeImage1Data: true,
      homeImage1Mime: true,
      homeImage2Data: true,
      homeImage2Mime: true,
    } as any),
  })) as any;

  const homeImage1 = await readSiteImage(formData, "homeImage1", "removeHomeImage1", {
    imageData: current?.homeImage1Data ?? null,
    imageMime: current?.homeImage1Mime ?? null,
  });
  const homeImage2 = await readSiteImage(formData, "homeImage2", "removeHomeImage2", {
    imageData: current?.homeImage2Data ?? null,
    imageMime: current?.homeImage2Mime ?? null,
  });

  const imageError = homeImage1.error ?? homeImage2.error;
  if (imageError) redirect(`/admin/contacto?status=home_image_${imageError}`);

  const sharedData = {
    phone: str(formData, "phone", 30),
    address: str(formData, "address", 240),
    addressNote: str(formData, "addressNote", 800),
    contactText: str(formData, "contactText", 800),
    instagramUrl: safeHttpUrl(str(formData, "instagramUrl", 500)),
    facebookUrl: safeHttpUrl(str(formData, "facebookUrl", 500)),
    mapsUrl: safeHttpUrl(str(formData, "mapsUrl", 900)),
    openingHours: str(formData, "openingHours", 1200),
    holidayHours: str(formData, "holidayHours", 500) || "Consultar horario en festivos",
    homeImage1Data: homeImage1.imageData,
    homeImage1Mime: homeImage1.imageMime,
    homeImage1Title: str(formData, "homeImage1Title", 120) || "La venta y su terraza",
    homeImage1Description: str(formData, "homeImage1Description", 500) || "Un rincón tradicional a la entrada de Benamahoma.",
    homeImage1CreditText: str(formData, "homeImage1CreditText", 160) || null,
    homeImage1CreditUrl: safeHttpUrl(str(formData, "homeImage1CreditUrl", 900)),
    homeImage2Data: homeImage2.imageData,
    homeImage2Mime: homeImage2.imageMime,
    homeImage2Title: str(formData, "homeImage2Title", 120) || "Benamahoma y su entorno",
    homeImage2Description: str(formData, "homeImage2Description", 500) || "Naturaleza, pueblo blanco y Sierra de Grazalema.",
    homeImage2CreditText: str(formData, "homeImage2CreditText", 160) || null,
    homeImage2CreditUrl: safeHttpUrl(str(formData, "homeImage2CreditUrl", 900)),
  };

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: ({ id: 1, ...sharedData, reservationEnabled: false } as any),
    update: (sharedData as any),
  });
  revalidatePath("/");
  revalidatePath("/contacto");
  revalidatePath("/admin");
  revalidatePath("/admin/contacto");
  revalidatePath("/api/portada/1/imagen");
  revalidatePath("/api/portada/2/imagen");
  redirect("/admin/contacto?status=saved");
}
