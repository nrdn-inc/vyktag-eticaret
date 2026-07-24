"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { EMAIL_REGEX, sendVerificationEmail } from "@/lib/customer-auth";

export interface RegisterState {
  error?: string;
  success?: boolean;
}

/**
 * Kayıt e-postayla doğrulanana kadar şifre alınmaz; hesap, kimse bilemeyeceği rastgele bir
 * yer tutucu şifre hash'iyle oluşturulur. Gerçek şifre, doğrulama bağlantısına tıklandığında
 * (/hesap/dogrula) belirlenir — böylece hesabı yalnızca e-postaya erişen kişi etkinleştirebilir.
 */
export async function registerCustomer(_prevState: RegisterState, formData: FormData): Promise<RegisterState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!fullName || !email) {
    return { error: "Ad soyad ve e-posta zorunludur." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { error: "Geçerli bir e-posta adresi girin." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.emailVerifiedAt) {
    return { error: "Bu e-posta adresiyle zaten doğrulanmış bir hesap var. Giriş yapmayı deneyin." };
  }

  if (existing && !existing.emailVerifiedAt) {
    // Bekleyen (doğrulanmamış) kayıt zaten var: kimlik bilgilerine dokunmadan doğrulama
    // e-postasını yeniden gönder (bkz. yukarıdaki not — şifre yalnızca doğrulamada belirlenir).
    return sendVerificationEmailSafely(existing.id, email, existing.fullName);
  }

  const placeholderPasswordHash = await hashPassword(randomBytes(32).toString("hex"));
  const user = await prisma.user.create({
    data: { email, phone: phone || null, passwordHash: placeholderPasswordHash, fullName },
  });

  return sendVerificationEmailSafely(user.id, email, fullName);
}

/** E-posta gönderimi (SMTP) bir sistem sınırıdır; hata durumunda kullanıcıya anlaşılır bir mesaj döner. */
async function sendVerificationEmailSafely(userId: string, email: string, fullName: string): Promise<RegisterState> {
  try {
    await sendVerificationEmail(userId, email, fullName);
    return { success: true };
  } catch (error) {
    console.error("[hesap/kayit] doğrulama e-postası gönderilemedi:", error);
    return { error: "Doğrulama e-postası gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin." };
  }
}
