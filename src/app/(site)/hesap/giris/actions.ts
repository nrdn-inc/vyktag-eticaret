"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CUSTOMER_SESSION_COOKIE, createCustomerSessionToken, verifyPassword } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/customer-auth";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/rate-limit";

export interface LoginState {
  error?: string;
  unverifiedEmail?: string;
}

const GENERIC_ERROR = "E-posta veya şifre hatalı.";
const RATE_LIMIT_ERROR = "Çok fazla başarısız deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export async function loginCustomer(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: GENERIC_ERROR };
  }

  // Kaba kuvvet koruması: aynı IP'den çok sayıda farklı hesap denemesi VE aynı hesaba
  // karşı çok sayıda deneme ayrı ayrı sınırlanır (bkz. rate-limit.ts).
  const ip = clientIpFromHeaders(await headers());
  const withinIpLimit = consumeRateLimit(`customer-login:ip:${ip}`, { max: 20, windowMs: 10 * 60 * 1000 });
  const withinAccountLimit = consumeRateLimit(`customer-login:acct:${ip}:${email}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!withinIpLimit || !withinAccountLimit) {
    return { error: RATE_LIMIT_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: GENERIC_ERROR };
  }

  if (!user.emailVerifiedAt) {
    // Doğrulanmamış hesapların şifresi henüz yok (bkz. hesap/dogrula) — şifreyi burada
    // kontrol etmeye çalışmak yerine doğrulama bağlantısını yeniden gönderiyoruz.
    try {
      await sendVerificationEmail(user.id, user.email, user.fullName);
    } catch (error) {
      console.error("[hesap/giris] doğrulama e-postası gönderilemedi:", error);
      return { error: "Doğrulama e-postası gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin." };
    }
    return {
      error: "Hesabınız henüz doğrulanmamış. Doğrulama bağlantısını yeniden gönderdik, e-postanızı kontrol edin.",
      unverifiedEmail: user.email,
    };
  }

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) {
    return { error: GENERIC_ERROR };
  }

  const token = createCustomerSessionToken(user.id);
  (await cookies()).set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/hesap");
}

export async function logoutCustomer(): Promise<void> {
  (await cookies()).delete(CUSTOMER_SESSION_COOKIE);
  redirect("/hesap/giris");
}
