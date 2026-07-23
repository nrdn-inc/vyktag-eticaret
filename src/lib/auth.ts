import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
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
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 gün

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

export interface AdminSessionPayload {
  userId: string;
  exp: number;
}

/** userId'yi imzalı, süresi dolan bir oturum token'ına (payload.imza) kodlar. */
export function createAdminSessionToken(userId: string): string {
  const payload: AdminSessionPayload = { userId, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

/** Token imzasını ve süresini doğrular; geçerliyse payload'ı döner, değilse null. */
export function verifyAdminSessionToken(token: string | undefined | null): AdminSessionPayload | null {
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
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as AdminSessionPayload;
    if (typeof payload.userId !== "string" || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
