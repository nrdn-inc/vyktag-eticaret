import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

const KEY_LENGTH = 64;

/** Şifreyi rastgele bir salt ile scrypt kullanarak hashler; sonuç "salt:hash" (hex) biçimindedir. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/** Girilen şifreyi saklanan "salt:hash" değeriyle zamanlama saldırılarına karşı güvenli şekilde karşılaştırır. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) {
    return false;
  }
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(hashHex, "hex");
  if (derivedKey.length !== storedKey.length) {
    return false;
  }
  return timingSafeEqual(derivedKey, storedKey);
}

export const ADMIN_SESSION_COOKIE = "vyktag_admin_session";
export const CUSTOMER_SESSION_COOKIE = "vyktag_musteri_oturum";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün
const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 saat
const TWO_FACTOR_TTL_MS = 10 * 60 * 1000; // 10 dakika

type TokenPurpose =
  | "admin-session"
  | "customer-session"
  | "email-verify"
  | "password-reset"
  | "2fa-pending"
  | "2fa-pending-totp";

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET .env dosyasında tanımlı değil.");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export interface SignedTokenPayload {
  userId: string;
  purpose: TokenPurpose;
  /** Üretim zamanı (ms) — eski (iat alanı olmayan) token'larla geriye dönük uyum için opsiyoneldir. */
  iat?: number;
  exp: number;
  /** Amaca özgü ek veri (ör. 2FA kod karması). Token imzalı olduğundan değiştirilemez. */
  data?: string;
}

/** userId'yi, amacı (purpose) belirtilen ve süresi dolan imzalı bir token'a kodlar. */
function createSignedToken(userId: string, purpose: TokenPurpose, ttlMs: number, data?: string): string {
  const payload: SignedTokenPayload = { userId, purpose, iat: Date.now(), exp: Date.now() + ttlMs, ...(data !== undefined ? { data } : {}) };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

/**
 * Token imzasını, süresini ve amacını (purpose) doğrular; geçerliyse payload'ı döner, değilse null.
 * Amaç kontrolü, ör. bir e-posta doğrulama token'ının oturum token'ı olarak kullanılmasını engeller.
 */
function verifySignedToken(
  token: string | undefined | null,
  expectedPurpose: TokenPurpose,
): SignedTokenPayload | null {
  if (!token) {
    return null;
  }
  const [payloadB64, signature] = token.split(".");
  if (!payloadB64 || !signature) {
    return null;
  }

  const expectedSignature = sign(payloadB64);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as SignedTokenPayload;
    if (
      typeof payload.userId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp < Date.now() ||
      payload.purpose !== expectedPurpose
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export type AdminSessionPayload = SignedTokenPayload;

export function createAdminSessionToken(userId: string): string {
  return createSignedToken(userId, "admin-session", SESSION_TTL_MS);
}

export function verifyAdminSessionToken(token: string | undefined | null): SignedTokenPayload | null {
  return verifySignedToken(token, "admin-session");
}

export function createCustomerSessionToken(userId: string): string {
  return createSignedToken(userId, "customer-session", SESSION_TTL_MS);
}

export function verifyCustomerSessionToken(token: string | undefined | null): SignedTokenPayload | null {
  return verifySignedToken(token, "customer-session");
}

/** Kayıt sonrası e-postaya gönderilen doğrulama bağlantısı için 24 saat geçerli token üretir. */
export function createEmailVerificationToken(userId: string): string {
  return createSignedToken(userId, "email-verify", EMAIL_VERIFICATION_TTL_MS);
}

export function verifyEmailVerificationToken(token: string | undefined | null): SignedTokenPayload | null {
  return verifySignedToken(token, "email-verify");
}

/** Şifremi unuttum e-postasındaki bağlantı için 1 saat geçerli token üretir. */
export function createPasswordResetToken(userId: string): string {
  return createSignedToken(userId, "password-reset", PASSWORD_RESET_TTL_MS);
}

export function verifyPasswordResetToken(token: string | undefined | null): SignedTokenPayload | null {
  return verifySignedToken(token, "password-reset");
}

/** 6 haneli 2FA kodunu, sunucu secret'ı olmadan çevrimdışı tahmin edilemeyecek şekilde HMAC ile karma yapar. */
function hashTwoFactorCode(code: string): string {
  return createHmac("sha256", getSessionSecret()).update(`2fa:${code}`).digest("hex");
}

/**
 * Giriş sırasında e-postayla gönderilecek rastgele 6 haneli bir 2FA kodu üretir ve kodun
 * karmasını taşıyan, 10 dakika geçerli imzalı bir "pending" token döner. Kodun kendisi hiçbir
 * yerde saklanmaz — yalnızca HMAC karması token içinde (imzalı, değiştirilemez) tutulur.
 */
export function createTwoFactorChallengeToken(userId: string): { token: string; code: string } {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const token = createSignedToken(userId, "2fa-pending", TWO_FACTOR_TTL_MS, hashTwoFactorCode(code));
  return { token, code };
}

/** Pending 2FA token'ını ve kullanıcının girdiği kodu doğrular; eşleşirse userId, değilse null döner. */
export function verifyTwoFactorChallengeToken(token: string | undefined | null, submittedCode: string): string | null {
  const payload = verifySignedToken(token, "2fa-pending");
  if (!payload?.data) {
    return null;
  }
  const expected = Buffer.from(payload.data);
  const actual = Buffer.from(hashTwoFactorCode(submittedCode));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return null;
  }
  return payload.userId;
}

/**
 * TOTP ile giriş yapan kullanıcılar için 10 dakika geçerli "pending" token üretir. E-posta
 * akışının aksine kodun kendisi (veya bir karması) token içinde taşınmaz — TOTP kodu, DB'deki
 * kalıcı sırdan doğrulama anında yeniden hesaplanır (bkz. totp.ts:verifyTotpCode).
 */
export function createTotpChallengeToken(userId: string): string {
  return createSignedToken(userId, "2fa-pending-totp", TWO_FACTOR_TTL_MS);
}

/** Pending TOTP giriş token'ını doğrular; geçerliyse userId, değilse null döner. */
export function verifyTotpChallengeToken(token: string | undefined | null): string | null {
  return verifySignedToken(token, "2fa-pending-totp")?.userId ?? null;
}
