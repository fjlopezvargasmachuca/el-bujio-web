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

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createMenuItem(formData: FormData) {
  await requireAdmin();
  await prisma.menuItem.create({
    data: {
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      category: menuCategory(str(formData, "category")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      priceTapaCents: parseEuroToCents(formData.get("priceTapa")),
      priceMediaCents: parseEuroToCents(formData.get("priceMedia")),
      pricePlatoCents: parseEuroToCents(formData.get("pricePlato")),
      active: formData.get("active") === "on",
      sortOrder: await nextMenuSortOrder(),
    },
  });
  revalidatePath("/");
  revalidatePath("/carta");
  revalidatePath("/admin");
  revalidatePath("/admin/carta");
  redirect("/admin/carta?status=created");
}

export async function updateMenuItem(id: string, formData: FormData) {
  await requireAdmin();
  await prisma.menuItem.update({
    where: { id },
    data: {
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      category: menuCategory(str(formData, "category")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      priceTapaCents: parseEuroToCents(formData.get("priceTapa")),
      priceMediaCents: parseEuroToCents(formData.get("priceMedia")),
      pricePlatoCents: parseEuroToCents(formData.get("pricePlato")),
      active: formData.get("active") === "on",
    },
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

export async function createSpecialItem(formData: FormData) {
  await requireAdmin();
  const type = specialType(str(formData, "type"));
  await prisma.specialItem.create({
    data: {
      type,
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      section: type === SpecialType.MENU_DIA ? menuSection(str(formData, "section", 40)) : null,
      priceCents: type === SpecialType.MENU_DIA ? null : parseEuroToCents(formData.get("price")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      active: formData.get("active") === "on",
      sortOrder: await nextSpecialSortOrder(type),
    },
  });
  revalidatePath(type === SpecialType.OFERTA ? "/ofertas" : "/menu-del-dia");
  revalidatePath("/admin");
  revalidatePath("/admin/especiales");
  redirect("/admin/especiales?status=created");
}

export async function updateSpecialItem(id: string, formData: FormData) {
  await requireAdmin();
  const current = await prisma.specialItem.findUnique({ where: { id } });
  if (!current) return;
  const type = specialType(str(formData, "type"));
  const typeChanged = current.type !== type;
  await prisma.specialItem.update({
    where: { id },
    data: {
      type,
      name: requiredName(formData),
      description: str(formData, "description", 1200) || null,
      section: type === SpecialType.MENU_DIA ? menuSection(str(formData, "section", 40)) : null,
      priceCents: type === SpecialType.MENU_DIA ? null : parseEuroToCents(formData.get("price")),
      ingredients: splitCsv(formData.get("ingredients")),
      allergens: sanitizeAllergens(formData.getAll("allergens")),
      active: formData.get("active") === "on",
      ...(typeChanged ? { sortOrder: await nextSpecialSortOrder(type) } : {}),
    },
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
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: { id: 1, menuDayPriceCents: price, reservationEnabled: false },
    update: { menuDayPriceCents: price },
  });
  revalidatePath("/menu-del-dia");
  revalidatePath("/admin/especiales");
  redirect("/admin/especiales?status=price");
}

export async function updateContact(formData: FormData) {
  await requireAdmin();
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      phone: str(formData, "phone", 30),
      address: str(formData, "address", 240),
      contactText: str(formData, "contactText", 800),
      instagramUrl: safeHttpUrl(str(formData, "instagramUrl", 500)),
      facebookUrl: safeHttpUrl(str(formData, "facebookUrl", 500)),
      mapsUrl: safeHttpUrl(str(formData, "mapsUrl", 900)),
      openingHours: str(formData, "openingHours", 1200),
      reservationEnabled: false,
    },
    update: {
      phone: str(formData, "phone", 30),
      address: str(formData, "address", 240),
      contactText: str(formData, "contactText", 800),
      instagramUrl: safeHttpUrl(str(formData, "instagramUrl", 500)),
      facebookUrl: safeHttpUrl(str(formData, "facebookUrl", 500)),
      mapsUrl: safeHttpUrl(str(formData, "mapsUrl", 900)),
      openingHours: str(formData, "openingHours", 1200),
    },
  });
  revalidatePath("/");
  revalidatePath("/contacto");
  revalidatePath("/admin");
  revalidatePath("/admin/contacto");
  redirect("/admin/contacto?status=saved");
}
