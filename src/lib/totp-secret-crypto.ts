import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * TOTP paylaşılan sırlarını veritabanında şifreli saklamak için AES-256-GCM yardımcıları.
 * Şifreler scrypt ile hashlenebilirken TOTP sırrı doğrulama anında düz metin olarak geri
 * gerekir — bu yüzden hash değil, simetrik şifreleme kullanılır. Anahtar, oturum imzalama
 * için zaten zorunlu olan ADMIN_SESSION_SECRET'tan sabit tuzla türetilir; böylece bir
 * veritabanı sızıntısı (uygulama sunucusu ele geçirilmedikçe) sırları açığa çıkarmaz.
 */

const KEY_SALT = "totp-secret-v1";
const IV_LENGTH = 12; // GCM için önerilen 96 bit

let cachedKey: Buffer | null = null;

function getKey(): Buffer {
  if (cachedKey) {
    return cachedKey;
  }
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET .env dosyasında tanımlı değil.");
  }
  cachedKey = scryptSync(secret, KEY_SALT, 32);
  return cachedKey;
}

/** Test ortamında env değiştiğinde anahtar önbelleğini sıfırlamak için. */
export function resetTotpSecretKeyCache(): void {
  cachedKey = null;
}

/** Base32 TOTP sırrını "iv:authTag:ciphertext" (hex) biçiminde şifreler. */
export function encryptTotpSecret(plain: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${cipher.getAuthTag().toString("hex")}:${encrypted.toString("hex")}`;
}

/** encryptTotpSecret çıktısını çözer; bozuk/oynanmış veri veya yanlış anahtar için null döner. */
export function decryptTotpSecret(stored: string | null | undefined): string | null {
  if (!stored) {
    return null;
  }
  try {
    const [ivHex, tagHex, encHex] = stored.split(":");
    if (!ivHex || !tagHex || !encHex) {
      return null;
    }
    const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([decipher.update(Buffer.from(encHex, "hex")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
