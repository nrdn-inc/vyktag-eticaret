import { describe, expect, it } from "vitest";
import { resolveCardVariant } from "@/components/visuals/NfcCard";
import {
  parseVariantAttributes,
  resolvePrintAccent,
  resolveVariantVisual,
} from "@/lib/product-variant-attributes";

describe("parseVariantAttributes", () => {
  it("parses a valid attributes object", () => {
    expect(parseVariantAttributes({ cardColor: "Siyah", printColor: "Altın", customDesign: true })).toEqual({
      cardColor: "Siyah",
      printColor: "Altın",
      customDesign: true,
    });
  });

  it("returns null for null/undefined", () => {
    expect(parseVariantAttributes(null)).toBeNull();
    expect(parseVariantAttributes(undefined)).toBeNull();
  });

  it("returns null for an invalid cardColor", () => {
    expect(parseVariantAttributes({ cardColor: "Kırmızı", printColor: "Altın", customDesign: false })).toBeNull();
  });

  it("returns null when customDesign is missing or not boolean", () => {
    expect(parseVariantAttributes({ cardColor: "Siyah", printColor: "Altın" })).toBeNull();
    expect(parseVariantAttributes({ cardColor: "Siyah", printColor: "Altın", customDesign: "evet" })).toBeNull();
  });
});

describe("resolvePrintAccent", () => {
  it("maps Altın to the altin accent", () => {
    expect(resolvePrintAccent("Altın")).toBe("altin");
  });

  it("maps Gümüş to the gumus accent", () => {
    expect(resolvePrintAccent("Gümüş")).toBe("gumus");
  });

  it("maps Siyah to the siyah accent", () => {
    expect(resolvePrintAccent("Siyah")).toBe("siyah");
  });
});

describe("resolveCardVariant", () => {
  // Regresyon: "beyaz · siyah baskı" gibi birleşik isimlerde eskiden .includes("siyah")
  // yanlışlıkla "siyah" (kart rengi) döndürüyordu; artık yalnızca başlangıç eşleşiyor.
  it("resolves a compound 'Beyaz · Siyah Baskı' name to beyaz, not siyah", () => {
    expect(resolveCardVariant("Beyaz · Siyah Baskı")).toBe("beyaz");
  });

  it("resolves a compound 'Siyah · Altın Baskı' name to siyah", () => {
    expect(resolveCardVariant("Siyah · Altın Baskı")).toBe("siyah");
  });

  it("falls back to özel for unrecognized names", () => {
    expect(resolveCardVariant("Standart")).toBe("özel");
    expect(resolveCardVariant(undefined)).toBe("özel");
  });
});

describe("resolveVariantVisual", () => {
  it("resolves cardVariant and accent from structured attributes", () => {
    expect(
      resolveVariantVisual({
        name: "Siyah · Gümüş Baskı",
        attributes: { cardColor: "Siyah", printColor: "Gümüş", customDesign: false },
      }),
    ).toEqual({ cardVariant: "siyah", accent: "gumus" });

    expect(
      resolveVariantVisual({
        name: "Beyaz · Altın Baskı",
        attributes: { cardColor: "Beyaz", printColor: "Altın", customDesign: true },
      }),
    ).toEqual({ cardVariant: "beyaz", accent: "altin" });
  });

  it("falls back to name-based resolution with the default (altin) accent when attributes are absent", () => {
    expect(resolveVariantVisual({ name: "Standart", attributes: null })).toEqual({
      cardVariant: "özel",
      accent: "altin",
    });
  });
});
