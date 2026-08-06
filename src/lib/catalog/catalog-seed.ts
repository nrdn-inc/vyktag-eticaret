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

const BASE_PRICE_KURUS = 34999;
const CUSTOM_DESIGN_PRICE_KURUS = 49999; // özel tasarım/logo ücretiyle birlikte

// Abonelik/Sınırsız seçildiğinde isteğe bağlı bir fiziksel kart eklenebilir (bkz. AddToCartForm
// — "İlk fiziksel kartım"/"Fiziksel kart" seçimi). Bu iki gizli SKU, o kart ek ücretini sunucu
// tarafında fiyatı doğrulanabilir bir OrderItem satırına bağlamak için var: standart varyant
// bir ek ücrete tabidir, özel tasarım/logo seçilirse onun yerine (standart ücretin üzerine değil)
// daha yüksek bir tek seferlik ücret alınır. Bu satırın var olması aynı zamanda admin'e (bkz.
// lib/orders/index.ts finalizeOrderPayment → DkartvizitHandoff) fiziksel kart gönderilmesi/hesap
// devri gerektiğini bildirir — kart seçilmediğinde (yenileme veya "Link") bu satır hiç eklenmez.
export const SUBSCRIPTION_FIRST_CARD_STANDARD_SKU = "VYK-ABONELIK-ILK-KART";
export const SUBSCRIPTION_FIRST_CARD_CUSTOM_DESIGN_SKU = "VYK-ABONELIK-ILK-KART-OZEL";
// Kart fiyatındaki özel tasarım farkıyla aynı tutar olması bilinçlidir.
export const SUBSCRIPTION_CUSTOM_DESIGN_FEE_KURUS = CUSTOM_DESIGN_PRICE_KURUS - BASE_PRICE_KURUS;

// Süreli kullanım hakkı (abonelik) planları ve "ilk fiziksel kart" ek ücreti şu an yalnızca
// bu vitrin ürününe iliştirilir (bkz. catalog/index.ts computeMinPriceKurus/durationOptions
// kullanımı) — başka bir ürün aktif edildiğinde onun fiyatına abonelik fiyatlarının
// karışmaması için bu slug'a göre filtrelenir.
export const FLAGSHIP_PRODUCT_SLUG = "vyktag-kart";

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
    // Vitrinde satılmaz (isActive: false, ürün listesinde görünmez) — yalnızca abonelik
    // akışında "ilk fiziksel kart" satırını sunucu tarafında doğrulanmış bir fiyata bağlamak
    // için var (bkz. dosya başı yorumu, lib/catalog/index.ts getSubscriptionFirstCardAddon).
    slug: "vyktag-abonelik-ilk-kart",
    name: "Abonelik — İlk Fiziksel Kart",
    description: "Abonelik satın alırken dahil olan ilk fiziksel kart (isteğe bağlı özel tasarım/logo ile).",
    images: [],
    isActive: false,
    variants: [
      {
        sku: SUBSCRIPTION_FIRST_CARD_STANDARD_SKU,
        name: "İlk Fiziksel Kart (standart)",
        priceKurus: 9999,
        // Envanter kavramı yok (dahiliyet/ücret satırı) — pratikte tükenmeyecek kadar yüksek tutulur.
        stock: 999_999,
      },
      {
        sku: SUBSCRIPTION_FIRST_CARD_CUSTOM_DESIGN_SKU,
        name: "İlk Fiziksel Kart (özel tasarım/logo)",
        priceKurus: SUBSCRIPTION_CUSTOM_DESIGN_FEE_KURUS,
        stock: 999_999,
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
  interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY" | "LIFETIME";
  features: string[];
}

// VYKTag Kart özelliğidir: fiziksel kart alımı (tek seferlik) süresiz/ömür boyu kullanım hakkı
// verir; abonelik ise belirli bir süre için (6 ay veya 1 yıl) sınırlı kullanım hakkı sunan
// alternatif bir seçenektir. "Premium" adı ve ek-özellik çerçevesi bilinçli olarak kullanılmıyor
// — vitrinde farklı özellik seviyeleri varmış izlenimi vermemek için tek fark süredir.
export const SUBSCRIPTION_PLANS: SubscriptionPlanSeed[] = [
  {
    slug: "vyktag-abonelik-6ay",
    name: "VYKTag Abonelik (6 Ay)",
    description: "VYKTag dijital profilinizi 6 ay boyunca tam yetkiyle kullanın.",
    priceKurus: 14999,
    interval: "SIX_MONTHS",
    features: ["6 ay boyunca tam kullanım hakkı", "Süre sonunda dilerseniz yenileyebilirsiniz"],
  },
  {
    slug: "vyktag-abonelik-yillik",
    name: "VYKTag Abonelik (Yıllık)",
    description: "VYKTag dijital profilinizi 12 ay boyunca tam yetkiyle kullanın.",
    priceKurus: 19999,
    interval: "YEARLY",
    features: ["12 ay boyunca tam kullanım hakkı", "6 aylık plana göre daha uygun aylık maliyet"],
  },
  {
    // Diğer planların aksine TEK SEFERLİK ödemedir, iyzico Abonelik (recurring) altyapısını
    // kullanmaz — bkz. schema.prisma SubscriptionInterval.LIFETIME yorumu. Bu yüzden
    // yalnızca ürün sayfasındaki sepet akışından satın alınabilir; fiyatlandırma sayfasındaki
    // "Abonelik" bölümünde gösterilmez (bkz. catalog/index.ts getActiveSubscriptionPlans filtresi).
    slug: "vyktag-sinirsiz",
    name: "VYKTag Sınırsız",
    description: "Dijital profilinize süre sınırı olmadan, tek seferlik ödemeyle erişin.",
    priceKurus: 39999,
    interval: "LIFETIME",
    features: ["Süre sınırı yok — kalıcı kullanım hakkı", "Tek seferlik ödeme, tekrar çekim yok"],
  },
];

/**
 * Yalnızca EKSİK kayıtları oluşturur — var olan bir ürün/varyant/plan'ın üzerine ASLA yazmaz.
 *
 * Önceden `upsert({ update: data, ... })` kullanılıyordu: bu, admin panelinden (bkz.
 * src/app/admin/(protected)/urunler, .../abonelikler) yapılan HER fiyat/metin değişikliğini,
 * bu fonksiyon tekrar çağrıldığında (ör. `npm run db:seed` yeniden çalıştırıldığında veya
 * `catalog-seed.db.test.ts`'in `beforeAll`'ı `npm run test:db` ile tetiklendiğinde) sessizce
 * sabit koddaki değerlere geri döndürüyordu — canlıda tam olarak bu yüzden bir fiyat
 * güncellemesi kayboldu. Bu fonksiyonun tek amacı artık ilk kurulumda boş bir veritabanını
 * doldurmak; var olan kayıtlara dokunmaz, admin panelinin tek gerçek kaynak olmasını korur.
 */
export async function seedCatalog(prisma: PrismaClient) {
  for (const { variants, isActive, ...productData } of CARD_PRODUCTS) {
    const data = { ...productData, isActive: isActive ?? true };
    const existingProduct = await prisma.product.findUnique({ where: { slug: data.slug } });
    const product = existingProduct ?? (await prisma.product.create({ data }));

    for (const { attributes, ...variant } of variants) {
      const existingVariant = await prisma.productVariant.findUnique({ where: { sku: variant.sku } });
      if (existingVariant) {
        continue;
      }
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: product.id,
          attributes: (attributes ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    }
  }

  for (const plan of SUBSCRIPTION_PLANS) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: plan.slug } });
    if (existingPlan) {
      continue;
    }
    await prisma.subscriptionPlan.create({ data: plan });
  }
}
