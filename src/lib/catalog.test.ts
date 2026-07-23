import { describe, expect, it } from "vitest";
import { getActiveProducts, getActiveSubscriptionPlans, getProductBySlug } from "@/lib/catalog";

// Katalog seed'i (bkz. catalog-seed.test.ts) canlı veritabanına zaten işlenmiş durumda;
// burada yalnızca okuma tarafını (mağaza/pazarlama sayfalarının kullandığı sorguları) doğruluyoruz.
describe("getActiveProducts", () => {
  it("returns every active product with a computed minimum price", async () => {
    const products = await getActiveProducts();

    expect(products.length).toBeGreaterThan(0);
    const kart = products.find((p) => p.slug === "vyktag-kart");
    expect(kart).toBeDefined();
    expect(kart?.variants.length).toBeGreaterThan(0);
    expect(kart?.minPriceKurus).toBe(Math.min(...(kart?.variants.map((v) => v.priceKurus) ?? [])));
  });
});

describe("getProductBySlug", () => {
  it("returns the matching product with its variants", async () => {
    const product = await getProductBySlug("vyktag-tag");
    expect(product?.name).toBe("Vyktag Tag");
    expect(product?.variants.some((v) => v.sku === "VYK-TAG-STD")).toBe(true);
  });

  it("returns null for an unknown slug", async () => {
    const product = await getProductBySlug("olmayan-urun");
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
