import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  SUBSCRIPTION_FIRST_CARD_STANDARD_SKU,
  SUBSCRIPTION_FIRST_CARD_CUSTOM_DESIGN_SKU,
  FLAGSHIP_PRODUCT_SLUG,
} from "@/lib/catalog/catalog-seed";
import { sanitizeProductImages } from "@/lib/product-image-upload";

/**
 * Kök layout `dynamic = "force-dynamic"` taşıdığından (CDN'in bozuk/eski RSC yanıtı sunmasını
 * kalıcı olarak engellemek için — bkz. layout.tsx yorumu) her sayfa isteği artık bu dosyadaki
 * sorguları TAZE çalıştırıyor; hiçbir HTML/RSC önbelleği bunları örtmüyor. Trafik arttıkça bu,
 * her sayfa görüntülemesi başına en az bir Prisma sorgusu demek — ve Hostinger hesabının saatte
 * yalnızca 500 yeni bağlantıya izin vermesi (bkz. prisma-pool.ts) bunu somut bir darboğaza
 * çevirir. Çözüm HTML'i değil, YALNIZCA VERİYİ önbelleklemek: `unstable_cache` (Next'in "Data
 * Cache"i) route'un `force-dynamic` olmasından bağımsız çalışır — sayfa yine her istekte taze
 * render edilir, ama aynı sorgu sonucu `CATALOG_CACHE_REVALIDATE_SECONDS` boyunca process
 * genelinde tekrar kullanılır. Böylece "her render taze olsun" garantisi (fatal hata sınıfını
 * önleyen) korunurken, art arda gelen istekler DB'ye tekrar tekrar gitmez.
 */
export const CATALOG_CACHE_TAG = "catalog";
const CATALOG_CACHE_REVALIDATE_SECONDS = 60;

export interface ProductDurationOption {
  subscriptionPlanId: string;
  slug: string;
  name: string;
  priceKurus: number;
  /** LIFETIME: tek seferlik ödeme, iyzico Abonelik (recurring) altyapısını kullanmaz — bkz. schema.prisma. */
  interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY" | "LIFETIME";
}

export interface ProductWithVariants {
  id: string;
  slug: string;
  name: string;
  description: string;
  minPriceKurus: number;
  variants: {
    id: string;
    name: string;
    sku: string;
    priceKurus: number;
    stock: number;
    attributes: unknown;
    /** Admin panelinden yüklenen gerçek ürün fotoğrafları (ilk eleman birincil). Boşsa çizilmiş canlı önizleme kullanılır. */
    images: string[];
  }[];
  /**
   * Fiziksel kart almadan, süreli kullanım hakkı sunan alternatif seçenekler (bkz.
   * SubscriptionPlan). Şu an tek bir vitrin ürünü (VYKTag Kart) aktif olduğundan tüm aktif
   * planlar her ürüne aynı şekilde iliştirilir — birden çok ürün aktif edildiğinde bu,
   * ürüne özgü bir ilişkiye (ör. Product.crossSellSubscriptionPlanId'ye benzer) taşınmalı.
   */
  durationOptions: ProductDurationOption[];
  /**
   * Abonelik/Sınırsız (durationOptions) seçilirken isteğe bağlı fiziksel kart için sunucu
   * tarafında doğrulanmış iki varyant: standart (sabit ek ücretli) ve özel tasarım/logo (bu
   * ücretin YERİNE geçen, daha yüksek tek seferlik ücret). null ise (seed çalışmamış) fiziksel
   * kart eklenemez. Kart seçilmediğinde (yenileme veya "Link") bu satır hiç eklenmez.
   */
  subscriptionFirstCardAddon: {
    standardVariantId: string;
    standardFeeKurus: number;
    customDesignVariantId: string;
    customDesignFeeKurus: number;
  } | null;
}

/**
 * Abonelik/Sınırsız + "fiziksel kart" satırının fiyatını YALNIZCA veritabanından okur (bkz.
 * lib/orders/index.ts createOrderFromCart — istemciden gelen hiçbir tutara güvenilmez).
 */
async function getSubscriptionFirstCardAddon(): Promise<ProductWithVariants["subscriptionFirstCardAddon"]> {
  const variants = await prisma.productVariant.findMany({
    where: { sku: { in: [SUBSCRIPTION_FIRST_CARD_STANDARD_SKU, SUBSCRIPTION_FIRST_CARD_CUSTOM_DESIGN_SKU] }, isActive: true },
    select: { sku: true, id: true, priceKurus: true },
  });
  const standard = variants.find((v) => v.sku === SUBSCRIPTION_FIRST_CARD_STANDARD_SKU);
  const customDesign = variants.find((v) => v.sku === SUBSCRIPTION_FIRST_CARD_CUSTOM_DESIGN_SKU);
  if (!standard || !customDesign) {
    return null;
  }
  return {
    standardVariantId: standard.id,
    standardFeeKurus: standard.priceKurus,
    customDesignVariantId: customDesign.id,
    customDesignFeeKurus: customDesign.priceKurus,
  };
}

async function getActiveDurationOptions(): Promise<ProductDurationOption[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true, priceKurus: true, interval: true },
    orderBy: { priceKurus: "asc" },
  });
  return plans.map((plan) => ({
    subscriptionPlanId: plan.id,
    slug: plan.slug,
    name: plan.name,
    priceKurus: plan.priceKurus,
    interval: plan.interval,
  }));
}

/**
 * Vitrindeki "başlangıç fiyatı" için en ucuz GERÇEKTEN ULAŞILABİLİR yolu döner.
 *
 * Süre planları (durationOptions) varsa çıplak varyant fiyatları artık ulaşılamaz: satın alma
 * her zaman bir plan üzerinden yapılıyor (bkz. AddToCartForm — "Sadece Fiziksel Kart" seçeneği
 * kaldırıldı), bu yüzden yalnızca plan fiyatları dikkate alınır (en ucuzu, kart eklenmeden —
 * ör. "Zaten kartım var" — zaten en düşük toplamı verir). Süre planı olmayan ürünlerde
 * (Tag/Phonecard gibi düz varyant satın alma) davranış değişmez.
 */
function computeMinPriceKurus(variantPrices: number[], durationOptions: ProductDurationOption[]): number {
  if (durationOptions.length > 0) {
    return Math.min(...durationOptions.map((o) => o.priceKurus));
  }
  return Math.min(...variantPrices);
}

/** DB'den gelen ham `images` (Json | null) alanını, biçimi doğrulanmış bir diziye normalize eder. */
function normalizeVariant<T extends { images: unknown }>(variant: T): Omit<T, "images"> & { images: string[] } {
  return { ...variant, images: sanitizeProductImages(variant.images) };
}

/** Vitrin/katalog sayfaları için aktif ürünleri, varyantlarıyla birlikte en düşük fiyata göre sıralı döner. */
export async function getActiveProducts(): Promise<ProductWithVariants[]> {
  const [products, durationOptions, subscriptionFirstCardAddon] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      // `include` yerine `select`: tam Product/ProductVariant satırı (images, zaman damgaları,
      // cross-sell FK'si...) değil, yalnızca vitrinin gerçekten kullandığı alanlar taşınır —
      // bu sorgu artık `force-dynamic` nedeniyle her sayfa görüntülemesinde çalışıyor.
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        variants: {
          where: { isActive: true },
          orderBy: { priceKurus: "asc" },
          select: { id: true, name: true, sku: true, priceKurus: true, stock: true, attributes: true, images: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    getActiveDurationOptions(),
    getSubscriptionFirstCardAddon(),
  ]);

  return products
    .filter((product) => product.variants.length > 0)
    .map((product) => {
      // Süreli kullanım hakkı (abonelik) planları yalnızca amiral gemisi ürüne iliştirilir —
      // aksi halde her ürünün "başlangıç fiyatı" yanlışlıkla en ucuz abonelik planına düşer
      // (bkz. FLAGSHIP_PRODUCT_SLUG yorumu).
      const isFlagship = product.slug === FLAGSHIP_PRODUCT_SLUG;
      const productDurationOptions = isFlagship ? durationOptions : [];
      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        minPriceKurus: computeMinPriceKurus(product.variants.map((v) => v.priceKurus), productDurationOptions),
        variants: product.variants.map(normalizeVariant),
        durationOptions: productDurationOptions,
        subscriptionFirstCardAddon: isFlagship ? subscriptionFirstCardAddon : null,
      };
    });
}

/** Sayfaların kullanması gereken, önbelleklenmiş sürüm — bkz. dosya başı yorumu. */
export const getActiveProductsCached = unstable_cache(getActiveProducts, ["catalog:active-products"], {
  tags: [CATALOG_CACHE_TAG],
  revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
});

/** generateStaticParams için tüm aktif ürün slug'larını döner. */
export async function getActiveProductSlugs(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return products.map((p) => p.slug);
}

/** Ürün detay sayfası için tek bir ürünü slug'a göre getirir. */
export async function getProductBySlug(slug: string): Promise<ProductWithVariants | null> {
  const [product, durationOptions, subscriptionFirstCardAddon] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        variants: {
          where: { isActive: true },
          orderBy: { priceKurus: "asc" },
          select: { id: true, name: true, sku: true, priceKurus: true, stock: true, attributes: true, images: true },
        },
      },
    }),
    getActiveDurationOptions(),
    getSubscriptionFirstCardAddon(),
  ]);

  if (!product || product.variants.length === 0) {
    return null;
  }

  // bkz. getActiveProducts içindeki aynı isimli yorum.
  const isFlagship = product.slug === FLAGSHIP_PRODUCT_SLUG;
  const productDurationOptions = isFlagship ? durationOptions : [];

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    minPriceKurus: computeMinPriceKurus(product.variants.map((v) => v.priceKurus), productDurationOptions),
    variants: product.variants.map(normalizeVariant),
    durationOptions: productDurationOptions,
    subscriptionFirstCardAddon: isFlagship ? subscriptionFirstCardAddon : null,
  };
}

/** Sayfaların kullanması gereken, önbelleklenmiş sürüm — bkz. dosya başı yorumu. */
export const getProductBySlugCached = unstable_cache(getProductBySlug, ["catalog:product-by-slug"], {
  tags: [CATALOG_CACHE_TAG],
  revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
});

export interface SubscriptionPlanSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceKurus: number;
  interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY";
  features: string[];
  /** iyzico tarafında bir Fiyatlandırma Planı tanımlıysa true — yalnızca bu durumda satın alınabilir. */
  purchasable: boolean;
}

/**
 * Fiyatlandırma sayfası için aktif abonelik planlarını fiyata göre sıralı döner.
 *
 * LIFETIME (Sınırsız) planları BİLİNÇLİ OLARAK hariç tutulur: bu sayfadaki "Abonelik" bölümünün
 * metni ("Dilediğiniz zaman iptal edebilirsiniz", "Kartı almadan süreli kullanım") tek seferlik/
 * kalıcı bir pakete uymuyor. Sınırsız yalnızca ürün sayfasındaki süre seçicisinden erişilebilir
 * (bkz. getActiveDurationOptions — o fonksiyon LIFETIME'ı filtrelemez).
 */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlanSummary[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true, interval: { not: "LIFETIME" } },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      priceKurus: true,
      interval: true,
      features: true,
      iyzicoPricingPlanRef: true,
    },
    orderBy: { priceKurus: "asc" },
  });

  return plans.map((plan) => ({
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    description: plan.description,
    priceKurus: plan.priceKurus,
    // `where: { interval: { not: "LIFETIME" } }` zaten filtreledi ama Prisma'nın döndürdüğü tip
    // bunu yansıtmaz (tam enum kalır) — bu yüzden burada dar tipe güvenle daraltılır.
    interval: plan.interval as SubscriptionPlanSummary["interval"],
    features: plan.features as string[],
    purchasable: plan.iyzicoPricingPlanRef !== null,
  }));
}

/** Sayfaların kullanması gereken, önbelleklenmiş sürüm — bkz. dosya başı yorumu. */
export const getActiveSubscriptionPlansCached = unstable_cache(
  getActiveSubscriptionPlans,
  ["catalog:active-subscription-plans"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_CACHE_REVALIDATE_SECONDS },
);

export interface PurchasableSubscriptionPlan {
  id: string;
  slug: string;
  name: string;
  priceKurus: number;
  interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY";
  iyzicoPricingPlanRef: string;
}

/**
 * Abonelik ödeme akışı için tek bir planı getirir. Plan pasifse ya da iyzico tarafında henüz bir
 * Fiyatlandırma Planı tanımlı değilse (satın alınamaz durumdaysa) null döner — çağıran taraf bunu
 * "satışa kapalı" olarak ele almalıdır. iyzicoPricingPlanRef yalnızca sunucu tarafında kullanılmalı,
 * istemciye gönderilmemelidir.
 *
 * BİLİNÇLİ OLARAK önbelleklenmiş bir sürümü YOK: bu fonksiyon abonelik başlatma server action'ında
 * (`abonelik/[slug]/actions.ts`) ödeme akışını başlatıp başlatmayacağına karar vermek için
 * kullanılıyor — burada `CATALOG_CACHE_REVALIDATE_SECONDS` kadar bayat bir "satın alınabilir"
 * durumu, deaktive edilmiş bir plan için kısa süreliğine ödeme akışının başlamasına izin
 * verebilirdi. Diğer katalog okumaları (ürün/plan listeleme) yalnızca vitrin amaçlı olduğu için
 * güvenle önbelleklenebiliyor; bu fonksiyon bir işlemi tetiklediği için her zaman taze kalmalı.
 */
export async function getPurchasableSubscriptionPlanBySlug(
  slug: string,
): Promise<PurchasableSubscriptionPlan | null> {
  const plan = await prisma.subscriptionPlan.findFirst({ where: { slug, isActive: true } });
  if (!plan || !plan.iyzicoPricingPlanRef) {
    return null;
  }
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    priceKurus: plan.priceKurus,
    // LIFETIME planları hiçbir zaman iyzicoPricingPlanRef taşımaz (bkz. schema.prisma), bu
    // yüzden yukarıdaki kontrolü geçen bir plan burada asla LIFETIME olamaz — TS bunu
    // çıkaramadığından dar tipe güvenle daraltılır.
    interval: plan.interval as PurchasableSubscriptionPlan["interval"],
    iyzicoPricingPlanRef: plan.iyzicoPricingPlanRef,
  };
}
