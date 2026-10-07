"use server";

import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createAdminSession } from "@/lib/auth";

const MAX_FAILURES = 5;
const BLOCK_MS = 15 * 60 * 1000;
type Attempt = { failures: number; blockedUntil: number };
const globalForLogin = globalThis as unknown as { elBujioLoginAttempts?: Map<string, Attempt> };
const attempts = globalForLogin.elBujioLoginAttempts ?? new Map<string, Attempt>();
globalForLogin.elBujioLoginAttempts = attempts;

async function throttleKey(email: string) {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${ip}|${email}|${process.env.AUTH_SECRET ?? ""}`).digest("hex");
}

export async function loginAdmin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(formData.get("password") ?? "").slice(0, 256);
  const key = await throttleKey(email);
  const now = Date.now();
  const attempt = attempts.get(key);

  if (attempt && attempt.blockedUntil > now) {
    redirect("/admin/login?error=Demasiados%20intentos.%20Prueba%20de%20nuevo%20en%2015%20minutos");
  }

  const user = email ? await prisma.adminUser.findUnique({ where: { email } }) : null;
  const valid = user && password ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !valid) {
    const failures = (attempt?.failures ?? 0) + 1;
    attempts.set(key, {
      failures,
      blockedUntil: failures >= MAX_FAILURES ? now + BLOCK_MS : 0,
    });
    redirect("/admin/login?error=Credenciales%20incorrectas");
  }

  attempts.delete(key);
  await createAdminSession(user.id, user.email);
  redirect("/admin");
}
