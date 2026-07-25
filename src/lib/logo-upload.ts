// Müşterinin ödeme öncesi yüklediği logonun canlı önizleme + sipariş kaydı için ortak
// kuralları. Bu dosya hem tarayıcıdaki yükleme bileşeni hem de sunucu tarafındaki
// sanitizePersonalization (bkz. orders.ts) tarafından kullanılır ki sınırlar tek yerde kalsın.

// Sipariş oluşturma kimlik doğrulaması gerektirmeyen tek herkese açık yazma yolu olduğundan
// (misafir alışveriş), burada makul bir üst sınır tutuyoruz — aksi halde personalization
// (Json, sınırsız) alanına keyfi büyüklükte veri gönderilebilir (depolama istismarı/DoS).
export const MAX_LOGO_DATA_URL_LENGTH = 220_000; // ~160 KB ham görsel karşılığı

// Yalnızca canvas'ta yeniden kodlanmış (rasterize edilmiş) PNG/JPEG/WEBP kabul edilir —
// ham SVG asla saklanmaz, çünkü <script> içerebilir; bkz. LogoUploadInput'taki rasterize adımı.
export const LOGO_DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

export function isValidLogoDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_LOGO_DATA_URL_LENGTH &&
    LOGO_DATA_URL_PATTERN.test(value)
  );
}
