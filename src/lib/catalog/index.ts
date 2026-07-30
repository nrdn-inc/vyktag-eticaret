import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

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
  }[];
}

/** Vitrin/katalog sayfaları için aktif ürünleri, varyantlarıyla birlikte en düşük fiyata göre sıralı döner. */
export async function getActiveProducts(): Promise<ProductWithVariants[]> {
  const products = await prisma.product.findMany({
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
        select: { id: true, name: true, sku: true, priceKurus: true, stock: true, attributes: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return products
    .filter((product) => product.variants.length > 0)
    .map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      minPriceKurus: product.variants[0].priceKurus,
      variants: product.variants,
    }));
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
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      variants: {
        where: { isActive: true },
        orderBy: { priceKurus: "asc" },
        select: { id: true, name: true, sku: true, priceKurus: true, stock: true, attributes: true },
      },
    },
  });

  if (!product || product.variants.length === 0) {
    return null;
  }

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    minPriceKurus: product.variants[0].priceKurus,
    variants: product.variants,
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

/** Fiyatlandırma sayfası için aktif abonelik planlarını fiyata göre sıralı döner. */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlanSummary[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
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
    interval: plan.interval,
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
    interval: plan.interval,
    iyzicoPricingPlanRef: plan.iyzicoPricingPlanRef,
  };
}
