"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyEmailVerificationToken, createCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/auth";
import { MIN_PASSWORD_LENGTH } from "@/lib/customer-auth";

export interface CompleteVerificationState {
  error?: string;
}

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * Doğrulama token'ını (yeniden) sunucu tarafında doğrular ve şifreyi belirler; token'ın kendisi
 * dışında hiçbir istemci girdisine güvenilmez. Başarılı olursa hesabı doğrulanmış işaretler ve
 * doğrudan oturum açar.
 */
export async function completeEmailVerification(
  _prevState: CompleteVerificationState,
  formData: FormData,
): Promise<CompleteVerificationState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const passwordAgain = String(formData.get("passwordAgain") ?? "");

  const payload = verifyEmailVerificationToken(token);
  if (!payload) {
    return { error: "Doğrulama bağlantısının süresi dolmuş veya geçersiz. Yeniden kayıt olmayı deneyin." };
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
    data: { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? new Date() },
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
