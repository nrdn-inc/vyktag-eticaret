import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CARD_VARIANT_PHOTOS, describeCardPhoto, getCardPhoto } from "@/lib/product-photos";
import type { CardColor, PrintColor, VariantAttributes } from "@/lib/product-variant-attributes";

/** Veritabanındaki VYKTag Kart varyantlarının tamamı (kart rengi × baskı rengi × özel tasarım). */
const ALL_COMBINATIONS: VariantAttributes[] = (
  [
    ["Siyah", "Altın"],
    ["Siyah", "Gümüş"],
    ["Beyaz", "Altın"],
    ["Beyaz", "Siyah"],
  ] as [CardColor, PrintColor][]
).flatMap(([cardColor, printColor]) => [
  { cardColor, printColor, customDesign: false },
  { cardColor, printColor, customDesign: true },
]);

function publicPath(src: string): string {
  return join(process.cwd(), "public", src.replace(/^\//, ""));
}

describe("getCardPhoto", () => {
  it("satılan her kombinasyon için bir fotoğraf döner", () => {
    for (const attributes of ALL_COMBINATIONS) {
      expect(getCardPhoto(attributes), JSON.stringify(attributes)).toBeTruthy();
    }
  });

  it("her kombinasyona farklı bir fotoğraf eşler", () => {
    const photos = ALL_COMBINATIONS.map((attributes) => getCardPhoto(attributes));
    expect(new Set(photos).size).toBe(ALL_COMBINATIONS.length);
  });

  it("attributes taşımayan varyantlar için null döner", () => {
    expect(getCardPhoto(null)).toBeNull();
  });

  it("satılmayan bir kombinasyon için null döner", () => {
    // Siyah kartın siyah baskısı üretilmiyor; fotoğrafı da yok.
    expect(getCardPhoto({ cardColor: "Siyah", printColor: "Siyah", customDesign: false })).toBeNull();
  });
});

describe("fotoğraf dosyaları", () => {
  // Bir görsel yeniden adlandırıldığında/silindiğinde üretimde 404 yerine burada patlasın.
  it("referans verilen tüm dosyalar public/ altında mevcut", () => {
    const referenced = [
      ...ALL_COMBINATIONS.map((attributes) => getCardPhoto(attributes)!),
      ...Object.values(CARD_VARIANT_PHOTOS),
    ];
    for (const src of new Set(referenced)) {
      expect(existsSync(publicPath(src)), src).toBe(true);
    }
  });
});

describe("describeCardPhoto", () => {
  it("kart rengini, baskı rengini ve tasarım türünü açıklar", () => {
    expect(describeCardPhoto({ cardColor: "Siyah", printColor: "Altın", customDesign: true })).toBe(
      "VYKTag Kart — siyah kart, altın baskı, özel tasarım; ön ve arka yüz",
    );
    expect(describeCardPhoto({ cardColor: "Beyaz", printColor: "Siyah", customDesign: false })).toBe(
      "VYKTag Kart — beyaz kart, siyah baskı, VYKTag baskılı; ön ve arka yüz",
    );
  });
});
