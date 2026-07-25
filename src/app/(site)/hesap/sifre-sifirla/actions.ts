"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CUSTOMER_SESSION_COOKIE,
  createCustomerSessionToken,
  hashPassword,
  verifyPasswordResetToken,
} from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/customer-auth";

export interface ResetPasswordState {
  error?: string;
}

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * Şifre sıfırlama token'ını (yeniden) sunucu tarafında doğrular; token'ın kendisi dışında
 * hiçbir istemci girdisine güvenilmez. Başarılı olursa şifreyi günceller, passwordChangedAt'i
 * damgalayarak olası çalınmış eski oturumları geçersiz kılar ve doğrudan oturum açar.
 */
export async function completePasswordReset(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordAgain = String(formData.get("passwordAgain") ?? "");

  const payload = verifyPasswordResetToken(token);
  if (!payload) {
    return { error: "Bağlantının süresi dolmuş veya geçersiz. Yeniden sıfırlama bağlantısı isteyin." };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.` };
  }
  if (password !== passwordAgain) {
    return { error: "Şifreler eşleşmiyor." };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return { error: "Hesap bulunamadı." };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordChangedAt: new Date() },
  });

  const sessionToken = createCustomerSessionToken(user.id);
  (await cookies()).set(CUSTOMER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/hesap");
}
