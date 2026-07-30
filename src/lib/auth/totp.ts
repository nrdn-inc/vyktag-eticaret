import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;

/** Rastgele 20 baytlık (160 bit) bir TOTP paylaşılan sırrı üretir, RFC 4648 Base32 ile kodlar. */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

/** RFC 4648 Base32 kodlama (dolgu ('=') yazılmaz — authenticator uygulamaları genelde dolgusuz bekler). */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

/** RFC 4648 Base32 çözme. Geçersiz karakterleri ve ('=') dolgusunu yok sayar. */
export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/**
 * RFC 4226 HOTP: paylaşılan sır + sayaç değerinden 6 haneli bir tek kullanımlık kod üretir.
 * Saf bir fonksiyondur; TOTP bunun üzerine sayaç yerine zamanı (30 saniyelik dilimler halinde) koyar.
 */
export function hotp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4);

  const hmac = createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

/** Authenticator uygulamalarının (Google Authenticator, Authy, 1Password vb.) tanıdığı otpauth:// kayıt URI'si. */
export function buildOtpAuthUrl(secret: string, accountEmail: string): string {
  const label = encodeURIComponent(`VYKTag:${accountEmail}`);
  const issuer = encodeURIComponent("VYKTag");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD_SECONDS}`;
}

/**
 * Girilen 6 haneli kodun, verilen Base32 sırla şu anki (veya bir önceki/sonraki 30 saniyelik
 * dilimdeki — saat kaymasına tolerans için) zaman dilimiyle eşleşip eşleşmediğini doğrular.
 */
export function verifyTotpCode(
  secretBase32: string,
  submittedCode: string,
  options: { now?: number; windowSteps?: number } = {},
): boolean {
  const code = submittedCode.trim();
  if (!/^\d{6}$/.test(code)) {
    return false;
  }

  const secret = base32Decode(secretBase32);
  if (secret.length === 0) {
    return false;
  }

  const now = options.now ?? Date.now();
  const windowSteps = options.windowSteps ?? 1;
  const currentStep = Math.floor(now / 1000 / TOTP_PERIOD_SECONDS);
  const submittedBuffer = Buffer.from(code);

  for (let delta = -windowSteps; delta <= windowSteps; delta++) {
    const expected = Buffer.from(hotp(secret, currentStep + delta));
    if (expected.length === submittedBuffer.length && timingSafeEqual(expected, submittedBuffer)) {
      return true;
    }
  }
  return false;
}
