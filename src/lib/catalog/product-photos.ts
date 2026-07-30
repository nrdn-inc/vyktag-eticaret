import type { CardColor, CardVariant, PrintColor, VariantAttributes } from "@/lib/catalog/product-variant-attributes";

/**
 * Gerçek ürün stüdyo fotoğrafları. Her fotoğraf kartın ön ve arka yüzünü birlikte gösterir.
 * Yalnızca VYKTag Kart için mevcuttur (Tag ve Phonecard farklı bir form faktörüne sahip
 * olduğundan bu fotoğraflarla temsil edilemez).
 */
export function cardPhotoKey(cardColor: CardColor, printColor: PrintColor, customDesign: boolean): string {
  return `${cardColor}|${printColor}|${customDesign ? "ozel" : "marka"}`;
}

/** Kart rengi × baskı rengi × özel tasarım kombinasyonlarının fotoğrafları (8 varyant). */
const CARD_COMBINATION_PHOTOS: Record<string, string> = {
  [cardPhotoKey("Siyah", "Altın", false)]: "/images/kart-siyah-altin.jpg",
  [cardPhotoKey("Siyah", "Gümüş", false)]: "/images/kart-siyah-gumus.jpg",
  [cardPhotoKey("Beyaz", "Altın", false)]: "/images/kart-beyaz-altin.jpg",
  [cardPhotoKey("Beyaz", "Siyah", false)]: "/images/kart-beyaz-siyah.jpg",
  [cardPhotoKey("Siyah", "Altın", true)]: "/images/kart-siyah-altin-ozel.jpg",
  [cardPhotoKey("Siyah", "Gümüş", true)]: "/images/kart-siyah-gumus-ozel.jpg",
  [cardPhotoKey("Beyaz", "Altın", true)]: "/images/kart-beyaz-altin-ozel.jpg",
  [cardPhotoKey("Beyaz", "Siyah", true)]: "/images/kart-beyaz-siyah-ozel.jpg",
};

/**
 * Seçili varyantın gerçek ürün fotoğrafını döner. Fotoğrafı olmayan bir kombinasyonda null
 * döner — çağıran taraf o durumda çizilmiş kart önizlemesine düşer.
 */
export function getCardPhoto(attributes: VariantAttributes | null): string | null {
  if (!attributes) {
    return null;
  }
  return (
    CARD_COMBINATION_PHOTOS[
      cardPhotoKey(attributes.cardColor, attributes.printColor, attributes.customDesign)
    ] ?? null
  );
}

/** Seçili varyantın fotoğrafı için ekran okuyucu açıklaması. */
export function describeCardPhoto(attributes: VariantAttributes): string {
  const design = attributes.customDesign ? "özel tasarım" : "VYKTag baskılı";
  const cardColor = attributes.cardColor.toLocaleLowerCase("tr-TR");
  const printColor = attributes.printColor.toLocaleLowerCase("tr-TR");
  return `VYKTag Kart — ${cardColor} kart, ${printColor} baskı, ${design}; ön ve arka yüz`;
}

/** Kaba kart teması bazında temsili fotoğraf (varyant detayı taşımayan liste/karusel alanları için). */
export const CARD_VARIANT_PHOTOS: Record<CardVariant, string> = {
  siyah: "/images/kart-siyah-altin.jpg",
  beyaz: "/images/kart-beyaz-altin.jpg",
  özel: "/images/kart-siyah-altin-ozel.jpg",
};

/** Gerçek fotoğrafı bulunan ürünlerin slug'ları. */
export const PRODUCTS_WITH_REAL_PHOTOS = new Set(["vyktag-kart"]);
