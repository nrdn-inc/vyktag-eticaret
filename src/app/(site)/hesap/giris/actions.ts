"use server";

import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { TwoFactorMethod, UserRole } from "@/generated/prisma/client";
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_ID_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  createAdminSessionToken,
  createCustomerSessionToken,
  createTotpChallengeToken,
  createTwoFactorChallengeToken,
  verifyPassword,
  verifyTotpChallengeToken,
  verifyTwoFactorChallengeToken,
} from "@/lib/auth";
import { sendTwoFactorCode, sendVerificationEmail } from "@/lib/auth/customer-auth";
import { clientIpFromHeaders, consumeRateLimit } from "@/lib/auth/rate-limit";
import { verifyTotpCode } from "@/lib/auth/totp";
import { decryptTotpSecret } from "@/lib/auth/totp-secret-crypto";

export interface LoginState {
  error?: string;
  unverifiedEmail?: string;
  /** Doldurulduğunda 2FA kod adımına geçilir; şifre zaten doğrulandı, oturum henüz açılmadı. */
  twoFactorToken?: string;
  /** twoFactorToken hangi doğrulama akışına gönderilecek (e-posta kodu mu, authenticator kodu mu). */
  twoFactorMethod?: "EMAIL" | "TOTP";
  redirectUrl?: string;
}

export interface TwoFactorLoginState {
  error?: string;
  /** Yanlış kod sonrası aynı 2FA adımında kalabilmek için token geri döner. */
  token?: string;
  redirectUrl?: string;
}

const GENERIC_ERROR = "Kullanıcı adı/e-posta veya şifre hatalı.";
const RATE_LIMIT_ERROR = "Çok fazla başarısız deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.";
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * Oturum çerezini yazar ve redirectUrl döner. redirect() sunucu tarafında
 * RSC JSON bug'ına yol açabildiği için yönlendirmeyi istemciye bırakıyoruz.
 */
async function establishSessionAndRedirect(user: { id: string; role: UserRole }): Promise<{ redirectUrl: string }> {
  const cookieStore = await cookies();
  const customerToken = createCustomerSessionToken(user.id);
  cookieStore.set(CUSTOMER_SESSION_COOKIE, customerToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  // httpOnly değil: sepetin (CartProvider) tarayıcıda doğru kullanıcıya scope edilmesi için
  // istemci JS tarafından okunabilmesi gerekiyor. Kimlik doğrulama için kullanılamaz.
  cookieStore.set(CUSTOMER_ID_COOKIE, user.id, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  if (user.role === UserRole.ADMIN) {
    const adminToken = createAdminSessionToken(user.id);
    cookieStore.set(ADMIN_SESSION_COOKIE, adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return { redirectUrl: "/admin/siparisler" };
  }

  return { redirectUrl: "/hesap" };
}

export async function loginCustomer(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("username") ?? "").trim().toLowerCase();
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
    // Bu gönderim IP'den bağımsız, hesap başına da sınırlanır: yukarıdaki acct limitinin
    // anahtarı IP içerdiğinden, IP değiştiren bir saldırgan onu aşıp e-posta bombalayabilirdi.
    if (!consumeRateLimit(`verify-send:${user.id}`, { max: 3, windowMs: 60 * 60 * 1000 })) {
      return { error: RATE_LIMIT_ERROR };
    }
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

  if (user.twoFactorEnabled) {
    if (user.twoFactorMethod === TwoFactorMethod.TOTP) {
      // Authenticator kodu DB'deki kalıcı sırdan anlık hesaplanır; e-posta gönderimi yok,
      // dolayısıyla e-posta bombalama sınırlamasına burada gerek yok.
      const twoFactorToken = createTotpChallengeToken(user.id);
      return { twoFactorToken, twoFactorMethod: "TOTP" };
    }

    // 2FA kodu gönderimini de ayrıca sınırlıyoruz — aksi halde tekrar tekrar giriş denemesi
    // hesabın e-postasını bombalamak için kullanılabilir.
    const withinTwoFaLimit = consumeRateLimit(`2fa-send:${user.id}`, { max: 5, windowMs: 10 * 60 * 1000 });
    if (!withinTwoFaLimit) {
      return { error: RATE_LIMIT_ERROR };
    }

    const { token: twoFactorToken, code } = createTwoFactorChallengeToken(user.id);
    try {
      await sendTwoFactorCode(user.email, user.fullName, code);
    } catch (error) {
      console.error("[hesap/giris] 2FA kodu gönderilemedi:", error);
      return { error: "Doğrulama kodu gönderilemedi. Lütfen birkaç dakika sonra tekrar deneyin." };
    }
    return { twoFactorToken, twoFactorMethod: "EMAIL" };
  }

  return establishSessionAndRedirect(user);
}

/** 2FA akışının ikinci adımı (e-posta yöntemi): e-postayla gönderilen kodu doğrular ve doğruysa oturumu açar. */
export async function verifyTwoFactorLogin(
  _prevState: TwoFactorLoginState,
  formData: FormData,
): Promise<TwoFactorLoginState> {
  const token = String(formData.get("token") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  // Kod alanı yalnızca 6 haneli sayısal, ama yine de kaba kuvvete karşı IP bazlı sınırlanır.
  const ip = clientIpFromHeaders(await headers());
  const withinLimit = consumeRateLimit(`2fa-verify:ip:${ip}`, { max: 10, windowMs: 10 * 60 * 1000 });
  if (!withinLimit) {
    return { error: RATE_LIMIT_ERROR, token };
  }

  // IP limiti dağıtık (çok IP'li) tahmin denemesini durdurmaz; her challenge token'ı için
  // toplam deneme sayısı da ayrıca sınırlanır. Kod kontrolü token doğrulamasının içinde
  // olduğundan anahtar userId yerine token'ın kendisinden (son 32 karakter = imza) türetilir.
  if (!consumeRateLimit(`2fa-verify:token:${token.slice(-32)}`, { max: 5, windowMs: 10 * 60 * 1000 })) {
    return { error: RATE_LIMIT_ERROR, token };
  }

  const userId = verifyTwoFactorChallengeToken(token, code);
  if (!userId) {
    return { error: "Kod hatalı veya süresi dolmuş.", token };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "Hesap bulunamadı." };
  }

  return establishSessionAndRedirect(user);
}

/** 2FA akışının ikinci adımı (authenticator yöntemi): uygulamada görünen kodu sırdan yeniden hesaplayıp doğrular. */
export async function verifyTotpLogin(
  _prevState: TwoFactorLoginState,
  formData: FormData,
): Promise<TwoFactorLoginState> {
  const token = String(formData.get("token") ?? "");
  const code = String(formData.get("code") ?? "").trim();

  const ip = clientIpFromHeaders(await headers());
  const withinLimit = consumeRateLimit(`2fa-verify:ip:${ip}`, { max: 10, windowMs: 10 * 60 * 1000 });
  if (!withinLimit) {
    return { error: RATE_LIMIT_ERROR, token };
  }

  const userId = verifyTotpChallengeToken(token);
  if (!userId) {
    return { error: "Kod hatalı veya süresi dolmuş.", token };
  }

  // IP limiti dağıtık (çok IP'li) tahmin denemesini durdurmaz; hesap başına da sınırlanır.
  if (!consumeRateLimit(`2fa-verify:acct:${userId}`, { max: 5, windowMs: 10 * 60 * 1000 })) {
    return { error: RATE_LIMIT_ERROR, token };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const secret = decryptTotpSecret(user?.twoFactorSecret);
  if (!user || !secret || !verifyTotpCode(secret, code)) {
    return { error: "Kod hatalı veya süresi dolmuş.", token };
  }

  // RFC 6238 §5.2: aynı (veya daha eski bir dilime ait) kodun ikinci kez kullanımı reddedilir —
  // araya giren biri kodu yakalasa bile pencere süresi içinde yeniden kullanamaz.
  const step = Math.floor(Date.now() / 1000 / 30);
  if (user.twoFactorLastStep !== null && step <= user.twoFactorLastStep) {
    return { error: "Kod hatalı veya süresi dolmuş.", token };
  }
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorLastStep: step } });

  return establishSessionAndRedirect(user);
}

export async function logoutCustomer(): Promise<{ redirectUrl: string }> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_SESSION_COOKIE);
  cookieStore.delete(CUSTOMER_ID_COOKIE);
  // Admin hesapları için hesabım girişinde admin çerezi de kurulduğundan (bkz.
  // establishSessionAndRedirect), tek çıkış işleminin her iki oturumu da kapatması gerekir.
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return { redirectUrl: "/hesap/giris" };
}
