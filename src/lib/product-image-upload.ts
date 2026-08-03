// Admin panelinden yüklenen ürün/varyant fotoğraflarının ortak kuralları (bkz. lib/logo-upload.ts
// — aynı desen, yalnızca ürün stüdyo fotoğrafları için daha büyük bir boyut sınırıyla). Bu dosya
// hem tarayıcıdaki yükleme bileşeni hem de sunucu tarafındaki admin action'lar tarafından
// kullanılır ki sınırlar tek yerde kalsın.

// Mevcut statik stüdyo fotoğrafları (public/images) 40-90 KB aralığında; buna makul bir pay
// bırakılır. Admin girişi (yalnızca doğrulanmış ADMIN rolü) olduğundan misafir sipariş akışındaki
// kadar sıkı bir sınır gerekmez, ama yine de ProductVariant.images (Json, sınırsız) alanına
// keyfi büyüklükte veri yazılmasını önlemek için bir tavan konur.
export const MAX_PRODUCT_IMAGE_DATA_URL_LENGTH = 500_000; // ~365 KB ham görsel karşılığı
export const MAX_IMAGES_PER_VARIANT = 4;

// Yalnızca canvas'ta yeniden kodlanmış (rasterize edilmiş) PNG/JPEG/WEBP kabul edilir — ham
// SVG asla saklanmaz, çünkü <script> içerebilir; bkz. ProductImageUploadInput'taki rasterize adımı.
export const PRODUCT_IMAGE_DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

export function isValidProductImageDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_PRODUCT_IMAGE_DATA_URL_LENGTH &&
    PRODUCT_IMAGE_DATA_URL_PATTERN.test(value)
  );
}

/** Bir varyantın görsel dizisini (DB'ye yazmadan önce) doğrular ve makul bir üst sınıra kırpar. */
export function sanitizeProductImages(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isValidProductImageDataUrl).slice(0, MAX_IMAGES_PER_VARIANT);
}
