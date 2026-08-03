// Türkçe karakterleri ASCII karşılıklarına çevirip URL-güvenli bir slug üretir. Admin panelinde
// ürün/abonelik planı adından otomatik slug önerisi için kullanılır (src/lib/catalog/catalog-seed.ts
// içindeki elle yazılmış slug'larla aynı biçim: küçük harf, kelimeler arası tire).
const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  İ: "i",
};

export function slugify(input: string): string {
  const replaced = input
    .split("")
    .map((char) => TURKISH_CHAR_MAP[char] ?? char)
    .join("");
  return replaced
    .toLocaleLowerCase("en-US")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // kalan aksanları (é, â, ...) ayır
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
