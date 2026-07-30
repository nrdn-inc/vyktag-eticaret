import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { TwoFactorMethod } from "@/generated/prisma/client";
import { buildOtpAuthUrl, generateTotpSecret, verifyTotpCode } from "@/lib/auth/totp";
import { decryptTotpSecret, encryptTotpSecret } from "@/lib/auth/totp-secret-crypto";
import { consumeRateLimit } from "@/lib/auth/rate-limit";

/** İki adımlı doğrulamayı e-posta yöntemiyle etkinleştirir. Yarım kalmış bir TOTP eşleştirmesinden kalan sır varsa temizlenir. */
export async function enableEmailTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorMethod: TwoFactorMethod.EMAIL,
      twoFactorSecret: null,
      twoFactorLastStep: null,
    },
  });
}

/** İki adımlı doğrulamayı (yöntemi ne olursa olsun) kapatır. */
export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorMethod: TwoFactorMethod.EMAIL,
      twoFactorSecret: null,
      twoFactorLastStep: null,
    },
  });
}

export interface TotpEnrollment {
  secret: string;
  otpAuthUrl: string;
  qrDataUrl: string;
}

/**
 * Authenticator uygulamasıyla eşleştirmenin ilk adımı: yeni bir TOTP sırrı üretir, DB'ye
 * yazar (henüz etkinleştirilmez — bkz. confirmTotpEnrollment) ve QR kod + manuel giriş için
 * sırrı döner.
 */
export async function startTotpEnrollment(userId: string, email: string): Promise<TotpEnrollment> {
  const secret = generateTotpSecret();
  // Sır veritabanında şifreli tutulur (bkz. totp-secret-crypto.ts); düz hali yalnızca
  // QR/manuel giriş için bu yanıtla istemciye döner.
  await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: encryptTotpSecret(secret) } });

  const otpAuthUrl = buildOtpAuthUrl(secret, email);
  const qrDataUrl = await QRCode.toDataURL(otpAuthUrl);

  return { secret, otpAuthUrl, qrDataUrl };
}

export type ConfirmTotpEnrollmentResult = { ok: true } | { error: string };

/** Eşleştirmenin ikinci adımı: uygulamada görünen 6 haneli kodu doğrular, doğruysa TOTP'yi etkinleştirir. */
export async function confirmTotpEnrollment(userId: string, code: string): Promise<ConfirmTotpEnrollmentResult> {
  if (!consumeRateLimit(`totp-confirm:${userId}`, { max: 5, windowMs: 10 * 60 * 1000 })) {
    return { error: "Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin." };
  }

  const fresh = await prisma.user.findUnique({ where: { id: userId } });
  const secret = decryptTotpSecret(fresh?.twoFactorSecret);
  if (!secret) {
    return { error: "Önce authenticator uygulamasıyla eşleştirmeyi başlatın." };
  }

  if (!verifyTotpCode(secret, code)) {
    return { error: "Kod hatalı veya süresi dolmuş." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { twoFactorEnabled: true, twoFactorMethod: TwoFactorMethod.TOTP },
  });
  return { ok: true };
}
