import { describe, expect, it } from "vitest";
import { getActiveProducts, getActiveSubscriptionPlans, getProductBySlug } from "@/lib/catalog";

// Katalog seed'i (bkz. catalog-seed.test.ts) canlı veritabanına zaten işlenmiş durumda;
// burada yalnızca okuma tarafını (mağaza/pazarlama sayfalarının kullandığı sorguları) doğruluyoruz.
describe("getActiveProducts", () => {
  it("computes minimum price from duration plans only when the product requires one (satın alma artık her zaman bir plan üzerinden yapılıyor — bkz. computeMinPriceKurus yorumu)", async () => {
    const products = await getActiveProducts();

    expect(products.length).toBeGreaterThan(0);
    const kart = products.find((p) => p.slug === "vyktag-kart");
    expect(kart).toBeDefined();
    expect(kart?.variants.length).toBeGreaterThan(0);
    expect(kart?.durationOptions.length).toBeGreaterThan(0);
    const expectedMin = Math.min(...(kart?.durationOptions.map((o) => o.priceKurus) ?? []));
    expect(kart?.minPriceKurus).toBe(expectedMin);
  });

  it("excludes temporarily hidden products (VYKTag Tag/Phonecard)", async () => {
    const products = await getActiveProducts();
    expect(products.some((p) => p.slug === "vyktag-tag")).toBe(false);
    expect(products.some((p) => p.slug === "vyktag-phonecard")).toBe(false);
  });
});

describe("getProductBySlug", () => {
  it("returns the matching product with its variants", async () => {
    const product = await getProductBySlug("vyktag-kart");
    expect(product?.name).toBe("VYKTag Kart");
    expect(product?.variants.some((v) => v.sku === "VYK-KART-SIYAH-GUMUS")).toBe(true);
  });

  it("returns null for an unknown slug", async () => {
    const product = await getProductBySlug("olmayan-urun");
    expect(product).toBeNull();
  });

  // VYKTag Tag ve Phonecard şimdilik gizli (isActive: false) — ileride tekrar açılacak.
  it("returns null for a temporarily hidden product", async () => {
    const product = await getProductBySlug("vyktag-tag");
    expect(product).toBeNull();
  });
});

describe("getActiveSubscriptionPlans", () => {
  it("returns plans ordered by ascending price", async () => {
    const plans = await getActiveSubscriptionPlans();

    expect(plans.length).toBeGreaterThan(0);
    for (let i = 1; i < plans.length; i++) {
      expect(plans[i].priceKurus).toBeGreaterThanOrEqual(plans[i - 1].priceKurus);
    }
  });
});
