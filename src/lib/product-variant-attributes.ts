import { resolveCardVariant, type CardVariant, type CardAccent } from "@/components/visuals/NfcCard";

export type CardColor = "Siyah" | "Beyaz";
export type PrintColor = "Gümüş" | "Altın" | "Siyah";

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

/** Bir baskı rengini NfcCard'ın metalik "accent" temasına eşler (yalnızca altın gerçekten altın görünür). */
export function resolvePrintAccent(printColor: PrintColor): CardAccent {
  return printColor === "Altın" ? "altin" : "gumus";
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
