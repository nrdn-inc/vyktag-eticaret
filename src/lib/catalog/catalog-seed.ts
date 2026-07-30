import type { PrismaClient, Prisma } from "@/generated/prisma/client";
import type { VariantAttributes } from "@/lib/catalog/product-variant-attributes";

interface ProductVariantSeed {
  sku: string;
  name: string;
  priceKurus: number;
  stock: number;
  attributes?: VariantAttributes;
}

interface ProductSeed {
  slug: string;
  name: string;
  description: string;
  images: string[];
  isActive?: boolean;
  variants: ProductVariantSeed[];
}

const BASE_PRICE_KURUS = 59990;
const CUSTOM_DESIGN_PRICE_KURUS = 79990; // BASE_PRICE_KURUS + özel tasarım/logo ücreti

export const CARD_PRODUCTS: ProductSeed[] = [
  {
    slug: "vyktag-kart",
    name: "VYKTag Kart",
    description:
      "Tek dokunuşla iletişim bilgilerinizi paylaşın. VYKTag Kart, NFC ve QR teknolojisiyle çalışan, dkartvizit.com profilinize bağlı fiziksel bir dijital kartvizittir. Kart rengi ve baskı rengi seçenekleriyle üretilir, ömür boyu kullanılır.",
    images: [],
    variants: [
      {
        sku: "VYK-KART-SIYAH-GUMUS",
        name: "Siyah · Gümüş Baskı",
        priceKurus: BASE_PRICE_KURUS,
        stock: 100,
        attributes: { cardColor: "Siyah", printColor: "Gümüş", customDesign: false },
      },
      {
        sku: "VYK-KART-SIYAH-GUMUS-OZEL",
        name: "Siyah · Gümüş Baskı · Özel Tasarım",
        priceKurus: CUSTOM_DESIGN_PRICE_KURUS,
        stock: 50,
        attributes: { cardColor: "Siyah", printColor: "Gümüş", customDesign: true },
      },
      {
        sku: "VYK-KART-SIYAH-ALTIN",
        name: "Siyah · Altın Baskı",
        priceKurus: BASE_PRICE_KURUS,
        stock: 100,
        attributes: { cardColor: "Siyah", printColor: "Altın", customDesign: false },
      },
      {
        sku: "VYK-KART-SIYAH-ALTIN-OZEL",
        name: "Siyah · Altın Baskı · Özel Tasarım",
        priceKurus: CUSTOM_DESIGN_PRICE_KURUS,
        stock: 50,
        attributes: { cardColor: "Siyah", printColor: "Altın", customDesign: true },
      },
      {
        sku: "VYK-KART-BEYAZ-SIYAHBASKI",
        name: "Beyaz · Siyah Baskı",
        priceKurus: BASE_PRICE_KURUS,
        stock: 100,
        attributes: { cardColor: "Beyaz", printColor: "Siyah", customDesign: false },
      },
      {
        sku: "VYK-KART-BEYAZ-SIYAHBASKI-OZEL",
        name: "Beyaz · Siyah Baskı · Özel Tasarım",
        priceKurus: CUSTOM_DESIGN_PRICE_KURUS,
        stock: 50,
        attributes: { cardColor: "Beyaz", printColor: "Siyah", customDesign: true },
      },
      {
        sku: "VYK-KART-BEYAZ-ALTIN",
        name: "Beyaz · Altın Baskı",
        priceKurus: BASE_PRICE_KURUS,
        stock: 100,
        attributes: { cardColor: "Beyaz", printColor: "Altın", customDesign: false },
      },
      {
        sku: "VYK-KART-BEYAZ-ALTIN-OZEL",
        name: "Beyaz · Altın Baskı · Özel Tasarım",
        priceKurus: CUSTOM_DESIGN_PRICE_KURUS,
        stock: 50,
        attributes: { cardColor: "Beyaz", printColor: "Altın", customDesign: true },
      },
    ],
  },
  {
    slug: "vyktag-tag",
    name: "VYKTag Tag",
    description:
      "Anahtarlığınızda taşıyabileceğiniz kompakt NFC etiket. Çantanıza, anahtarlığınıza veya defterinize takarak dijital profilinizi her an yanınızda taşıyın.",
    images: [],
    // Yakında açılacak: şimdilik vitrinden gizli (bkz. getActiveProducts).
    isActive: false,
    variants: [{ sku: "VYK-TAG-STD", name: "Standart", priceKurus: 39990, stock: 150 }],
  },
  {
    slug: "vyktag-phonecard",
    name: "VYKTag Phonecard",
    description:
      "Telefonunuzun arkasına yapıştırılan ince NFC kart. Telefonunuzu göstermeniz yeterli, kartvizitiniz her zaman elinizin altında.",
    images: [],
    // Yakında açılacak: şimdilik vitrinden gizli (bkz. getActiveProducts).
    isActive: false,
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
    name: "VYKTag Premium (Aylık)",
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
    name: "VYKTag Premium (Yıllık)",
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
  for (const { variants, isActive, ...productData } of CARD_PRODUCTS) {
    const data = { ...productData, isActive: isActive ?? true };
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });

    for (const { attributes, ...variant } of variants) {
      const variantData = {
        ...variant,
        productId: product.id,
        attributes: (attributes ?? undefined) as Prisma.InputJsonValue | undefined,
      };
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: variantData,
        create: variantData,
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
