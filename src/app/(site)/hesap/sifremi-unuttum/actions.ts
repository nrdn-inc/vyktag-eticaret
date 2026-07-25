"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/customer-auth";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/rate-limit";

export interface ForgotPasswordState {
  error?: string;
  success?: boolean;
}

const RATE_LIMIT_ERROR = "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";

/**
 * Kullanıcı numaralandırmasını (enumeration) önlemek için hesap var/yok ya da doğrulanmış
 * olup olmadığı fark etmeksizin her zaman aynı genel başarı durumunu döneriz; e-posta yalnızca
 * doğrulanmış bir hesap gerçekten varsa gönderilir.
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
  if (user?.emailVerifiedAt) {
    try {
      await sendPasswordResetEmail(user.id, user.email, user.fullName);
    } catch (error) {
      console.error("[hesap/sifremi-unuttum] e-posta gönderilemedi:", error);
    }
  }

  return { success: true };
}
