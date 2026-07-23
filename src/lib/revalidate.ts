/** On-demand revalidation ile yenilenecek ISR sayfa yolları (katalog verisi çeken sayfalar). */
export const REVALIDATE_PATHS = ["/", "/urunler", "/fiyatlandirma"] as const;

/**
 * On-demand yenileme isteğinin yetkili olup olmadığını doğrular.
 * Sunucuda gizli anahtar tanımlı değilse ya da gönderilen anahtar eşleşmiyorsa reddedilir.
 */
export function isRevalidateAuthorized(
  provided: string | null,
  expected: string | undefined,
): boolean {
  if (!expected || !provided) {
    return false;
  }
  return provided === expected;
}
