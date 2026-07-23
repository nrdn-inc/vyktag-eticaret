import type { PrismaClient } from "@/generated/prisma/client";

interface ProductVariantSeed {
  sku: string;
  name: string;
  priceKurus: number;
  stock: number;
}

interface ProductSeed {
  slug: string;
  name: string;
  description: string;
  images: string[];
  variants: ProductVariantSeed[];
}

export const CARD_PRODUCTS: ProductSeed[] = [
  {
    slug: "vyktag-kart",
    name: "Vyktag Kart",
    description:
      "Tek dokunuşla iletişim bilgilerinizi paylaşın. Vyktag Kart, NFC ve QR teknolojisiyle çalışan, dkartvizit.com profilinize bağlı fiziksel bir dijital kartvizittir. Logo ve kişiselleştirme seçenekleriyle üretilir, ömür boyu kullanılır.",
    images: [],
    variants: [
      { sku: "VYK-KART-SIYAH", name: "Siyah", priceKurus: 59990, stock: 100 },
      { sku: "VYK-KART-BEYAZ", name: "Beyaz", priceKurus: 59990, stock: 100 },
      { sku: "VYK-KART-CUSTOM", name: "Özel Tasarım", priceKurus: 79990, stock: 50 },
    ],
  },
  {
    slug: "vyktag-tag",
    name: "Vyktag Tag",
    description:
      "Anahtarlığınızda taşıyabileceğiniz kompakt NFC etiket. Çantanıza, anahtarlığınıza veya defterinize takarak dijital profilinizi her an yanınızda taşıyın.",
    images: [],
    variants: [{ sku: "VYK-TAG-STD", name: "Standart", priceKurus: 39990, stock: 150 }],
  },
  {
    slug: "vyktag-phonecard",
    name: "Vyktag Phonecard",
    description:
      "Telefonunuzun arkasına yapıştırılan ince NFC kart. Telefonunuzu göstermeniz yeterli, kartvizitiniz her zaman elinizin altında.",
    images: [],
    variants: [{ sku: "VYK-PHONECARD-STD", name: "Standart", priceKurus: 44990, stock: 100 }],
  },
];

interface SubscriptionPlanSeed {
  slug: string;
  name: string;
  description: string;
  priceKurus: number;
  interval: "MONTHLY" | "YEARLY";
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanSeed[] = [
  {
    slug: "vyktag-premium-aylik",
    name: "Vyktag Premium (Aylık)",
    description: "Dijital profilinizi bir üst seviyeye taşıyan aylık premium abonelik.",
    priceKurus: 4990,
    interval: "MONTHLY",
    features: [
      "Gelişmiş profil görüntülenme analitiği",
      "Sınırsız bağlantı/link ekleme",
      "Özel profil temaları",
      "Öncelikli müşteri desteği",
    ],
  },
  {
    slug: "vyktag-premium-yillik",
    name: "Vyktag Premium (Yıllık)",
    description: "Yıllık ödemede iki ay bedava — aynı premium özellikler, daha uygun fiyat.",
    priceKurus: 49900,
    interval: "YEARLY",
    features: [
      "Gelişmiş profil görüntülenme analitiği",
      "Sınırsız bağlantı/link ekleme",
      "Özel profil temaları",
      "Öncelikli müşteri desteği",
    ],
  },
];

export async function seedCatalog(prisma: PrismaClient) {
  for (const { variants, ...productData } of CARD_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    });

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: { ...variant, productId: product.id },
        create: { ...variant, productId: product.id },
      });
    }
  }

  for (const plan of SUBSCRIPTION_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
}
