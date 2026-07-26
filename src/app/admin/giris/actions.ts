"use server";

import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/client";
import { ADMIN_SESSION_COOKIE, CUSTOMER_SESSION_COOKIE, createAdminSessionToken, verifyPassword } from "@/lib/auth";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
  redirectUrl?: string;
}

const GENERIC_ERROR = "Kullanıcı adı/e-posta veya şifre hatalı.";
const RATE_LIMIT_ERROR = "Çok fazla başarısız deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function loginAdmin(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: GENERIC_ERROR };
  }

  // Kaba kuvvet koruması: aynı IP'den çok sayıda farklı hesap denemesi VE aynı hesaba
  // karşı çok sayıda deneme ayrı ayrı sınırlanır (bkz. rate-limit.ts).
  const ip = clientIpFromHeaders(await headers());
  const withinIpLimit = consumeRateLimit(`admin-login:ip:${ip}`, { max: 20, windowMs: 10 * 60 * 1000 });
  const withinAccountLimit = consumeRateLimit(`admin-login:acct:${ip}:${email}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!withinIpLimit || !withinAccountLimit) {
    return { error: RATE_LIMIT_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== UserRole.ADMIN) {
    return { error: GENERIC_ERROR };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: GENERIC_ERROR };
  }

  const token = createAdminSessionToken(user.id);
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return { redirectUrl: "/admin/siparisler" };
}

export async function logoutAdmin(): Promise<{ redirectUrl: string }> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  // Hesabım girişinde admin hesapları için müşteri çerezi de kurulduğundan (bkz.
  // hesap/giris/actions.ts), buradan çıkışın da o oturumu kapatması gerekir.
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  return { redirectUrl: "/admin/giris" };
}
