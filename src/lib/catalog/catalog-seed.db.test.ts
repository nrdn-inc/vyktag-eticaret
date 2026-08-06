import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { CARD_PRODUCTS, SUBSCRIPTION_PLANS, seedCatalog } from "@/lib/catalog/catalog-seed";

/**
 * seedCatalog yalnızca eksik kayıtları oluşturur, var olanların üzerine yazmaz (bkz.
 * catalog-seed.ts'teki seedCatalog yorumu — bu davranış, admin panelinden yapılan fiyat/metin
 * değişikliklerinin bu test paketi (npm run test:db) her çalıştığında sessizce sabit koddaki
 * değerlere geri dönmesini önlemek için bilinçli olarak böyle). Bu yüzden burada "seed sonrası
 * fiyat tam olarak seed değeriyle eşleşir" diye TEST EDİLMEZ — canlıda admin tarafından
 * değiştirilmiş gerçek bir fiyat, bu testi haksız yere kırar. Bunun yerine değişmediği doğrulanır.
 */
describe("seedCatalog", () => {
  it("does not modify a product/variant that already exists", async () => {
    const sampleProductSeed = CARD_PRODUCTS[0];
    const sampleVariantSeed = sampleProductSeed.variants[0];

    const beforeProduct = await prisma.product.findUnique({ where: { slug: sampleProductSeed.slug } });
    const beforeVariant = await prisma.productVariant.findUnique({ where: { sku: sampleVariantSeed.sku } });
    expect(beforeProduct, "bu test canlı DB'de zaten seed edilmiş bir katalog varsayar").not.toBeNull();
    expect(beforeVariant).not.toBeNull();

    await seedCatalog(prisma);

    const afterProduct = await prisma.product.findUnique({ where: { slug: sampleProductSeed.slug } });
    const afterVariant = await prisma.productVariant.findUnique({ where: { sku: sampleVariantSeed.sku } });
    expect(afterProduct?.name).toBe(beforeProduct?.name);
    expect(afterVariant?.priceKurus).toBe(beforeVariant?.priceKurus);
  });

  it("does not modify a subscription plan that already exists", async () => {
    const samplePlanSeed = SUBSCRIPTION_PLANS[0];
    const before = await prisma.subscriptionPlan.findUnique({ where: { slug: samplePlanSeed.slug } });
    expect(before, "bu test canlı DB'de zaten seed edilmiş planlar varsayar").not.toBeNull();

    await seedCatalog(prisma);

    const after = await prisma.subscriptionPlan.findUnique({ where: { slug: samplePlanSeed.slug } });
    expect(after?.priceKurus).toBe(before?.priceKurus);
  });
});
