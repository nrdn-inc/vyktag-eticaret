// Blog yazısı kapak görseli için sınırlar (bkz. lib/product-image-upload.ts — aynı desen,
// tek bir kapak görseli için). Vitrin kartında ve OG/Twitter paylaşımında kullanılacağından
// ürün stüdyo fotoğrafına yakın bir boyut tavanı yeterli.
export const MAX_BLOG_COVER_DATA_URL_LENGTH = 500_000; // ~365 KB ham görsel karşılığı

// Yalnızca canvas'ta yeniden kodlanmış (rasterize edilmiş) PNG/JPEG/WEBP kabul edilir — ham
// SVG asla saklanmaz, çünkü <script> içerebilir.
export const BLOG_COVER_DATA_URL_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/;

export function isValidBlogCoverDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_BLOG_COVER_DATA_URL_LENGTH &&
    BLOG_COVER_DATA_URL_PATTERN.test(value)
  );
}

/** Kapak görselini (DB'ye yazmadan önce) doğrular; geçersizse null döner. */
export function sanitizeBlogCoverImage(value: unknown): string | null {
  return isValidBlogCoverDataUrl(value) ? value : null;
}
