export type CardColor = "Siyah" | "Beyaz";
export type PrintColor = "Gümüş" | "Altın" | "Siyah";

/** Kartın görsel teması (canlı önizleme + gerçek ürün fotoğrafı seçimi için). */
export type CardVariant = "siyah" | "beyaz" | "özel";
/** Baskı rengi teması — karttaki tüm yazı/simge/QR bu renkle boyanır. */
export type CardAccent = "altin" | "gumus" | "siyah";

/**
 * Ürün varyant adını (ör. "Siyah · Altın Baskı") kart temasına eşler.
 *
 * Bilinçli olarak burada, `components/visuals/NfcCard.tsx`'te değil: bu saf bir domain
 * fonksiyonu, server-render edilen sayfalardan (ör. `urunler/page.tsx`) doğrudan çağrılıyor.
 * Bir UI bileşeninden export edilseydi, o bileşen ileride `"use client"` alırsa (görsel
 * bileşenler için makul bir ihtimal) bu çağrı yerleri kırılırdı — düz bir fonksiyon "use
 * client" modülünden Server Component'e opak bir client reference olarak geçer, çağrılamaz.
 */
export function resolveCardVariant(variantName: string | undefined): CardVariant {
  const normalized = (variantName ?? "").trim().toLocaleLowerCase("tr-TR");
  if (normalized.startsWith("siyah")) return "siyah";
  if (normalized.startsWith("beyaz")) return "beyaz";
  return "özel";
}

/** VYKTag Kart varyantlarının yapılandırılmış seçenekleri (ProductVariant.attributes). */
export interface VariantAttributes {
  cardColor: CardColor;
  printColor: PrintColor;
  customDesign: boolean;
}

/** Prisma'dan gelen ham Json değerini güvenli şekilde VariantAttributes'a çevirir. */
export function parseVariantAttributes(value: unknown): VariantAttributes | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const obj = value as Record<string, unknown>;
  if (
    (obj.cardColor === "Siyah" || obj.cardColor === "Beyaz") &&
    (obj.printColor === "Gümüş" || obj.printColor === "Altın" || obj.printColor === "Siyah") &&
    typeof obj.customDesign === "boolean"
  ) {
    return { cardColor: obj.cardColor, printColor: obj.printColor, customDesign: obj.customDesign };
  }
  return null;
}

/** Bir baskı rengini NfcCard'ın metalik "accent" temasına birebir eşler. */
export function resolvePrintAccent(printColor: PrintColor): CardAccent {
  if (printColor === "Altın") return "altin";
  if (printColor === "Gümüş") return "gumus";
  return "siyah";
}

/**
 * Bir varyantın canlı önizlemede nasıl görüneceğini çözer: attributes varsa kart/baskı
 * rengine göre, yoksa (Tag/Phonecard gibi eski düz varyantlar) isimden tahminle.
 */
export function resolveVariantVisual(variant: { name: string; attributes: unknown }): {
  cardVariant: CardVariant;
  accent: CardAccent;
} {
  const parsed = parseVariantAttributes(variant.attributes);
  if (parsed) {
    return {
      cardVariant: parsed.cardColor === "Siyah" ? "siyah" : "beyaz",
      accent: resolvePrintAccent(parsed.printColor),
    };
  }
  return { cardVariant: resolveCardVariant(variant.name), accent: "altin" };
}
