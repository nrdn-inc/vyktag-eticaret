import { timingSafeEqual } from "node:crypto";

/** On-demand revalidation ile yenilenecek ISR sayfa yolları (katalog verisi çeken sayfalar). */
export const REVALIDATE_PATHS = ["/", "/urunler", "/fiyatlandirma"] as const;

/**
 * On-demand yenileme isteğinin yetkili olup olmadığını doğrular.
 * Sunucuda gizli anahtar tanımlı değilse ya da gönderilen anahtar eşleşmiyorsa reddedilir.
 *
 * Karşılaştırma `timingSafeEqual` ile yapılır: `===` kullanmak, string'in ilk kaç
 * karakterinin doğru olduğuna göre yanıt süresinde ölçülebilir farklar bırakır ve
 * anahtar karakter karakter tahmin edilebilir hale gelir (zamanlama saldırısı).
 */
export function isRevalidateAuthorized(
  provided: string | null,
  expected: string | undefined,
): boolean {
  if (!expected || !provided) {
    return false;
  }
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }
  return timingSafeEqual(providedBuffer, expectedBuffer);
}
