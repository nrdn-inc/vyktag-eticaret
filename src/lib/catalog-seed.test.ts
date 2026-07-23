import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { CARD_PRODUCTS, SUBSCRIPTION_PLANS, seedCatalog } from "@/lib/catalog-seed";

// Upsert tabanlı olduğu için gerçek veritabanına karşı güvenle tekrar çalıştırılabilir.
describe("seedCatalog", () => {
  beforeAll(async () => {
    await seedCatalog(prisma);
  });

  it("creates every product with its variants", async () => {
    for (const productSeed of CARD_PRODUCTS) {
      const product = await prisma.product.findUnique({
        where: { slug: productSeed.slug },
        include: { variants: true },
      });

      expect(product).not.toBeNull();
      expect(product?.name).toBe(productSeed.name);
      expect(product?.variants).toHaveLength(productSeed.variants.length);

      for (const variantSeed of productSeed.variants) {
        const variant = product?.variants.find((v) => v.sku === variantSeed.sku);
        expect(variant).toBeDefined();
        expect(variant?.priceKurus).toBe(variantSeed.priceKurus);
      }
    }
  });

  it("creates every subscription plan", async () => {
    for (const planSeed of SUBSCRIPTION_PLANS) {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { slug: planSeed.slug },
      });

      expect(plan).not.toBeNull();
      expect(plan?.priceKurus).toBe(planSeed.priceKurus);
      expect(plan?.interval).toBe(planSeed.interval);
    }
  });
});
