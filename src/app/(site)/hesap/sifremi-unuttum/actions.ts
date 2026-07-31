"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/auth/customer-auth";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/auth/rate-limit";

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

const RATE_LIMIT_ERROR = "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";

/**
 * Not: kullanıcı numaralandırmasını (enumeration) önleyen "her zaman aynı genel başarı"
 * yaklaşımı bilinçli olarak terk edildi — talep üzerine e-postanın sistemde kayıtlı olup
 * olmadığı kullanıcıya doğrudan bildirilir.
 */
export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    return { error: "E-posta adresi zorunludur." };
  }

  const ip = clientIpFromHeaders(await headers());
  const withinIpLimit = consumeRateLimit(`pwreset:ip:${ip}`, { max: 10, windowMs: 60 * 60 * 1000 });
  const withinEmailLimit = consumeRateLimit(`pwreset:email:${email}`, { max: 3, windowMs: 60 * 60 * 1000 });
  if (!withinIpLimit || !withinEmailLimit) {
    return { error: RATE_LIMIT_ERROR };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Bu e-posta adresi sistemde kayıtlı değil." };
  }
  if (!user.emailVerifiedAt) {
    return { error: "Bu e-posta adresi henüz doğrulanmamış. Önce e-postanızı doğrulamanız gerekir." };
  }

  try {
    await sendPasswordResetEmail(user.id, user.email, user.fullName);
  } catch (error) {
    console.error("[hesap/sifremi-unuttum] e-posta gönderilemedi:", error);
    return { error: "E-posta gönderilirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin." };
  }

  return { success: true };
}
