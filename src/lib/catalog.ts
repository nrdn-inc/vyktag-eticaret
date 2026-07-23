import { prisma } from "@/lib/prisma";

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
  }[];
}

/** Vitrin/katalog sayfaları için aktif ürünleri, varyantlarıyla birlikte en düşük fiyata göre sıralı döner. */
export async function getActiveProducts(): Promise<ProductWithVariants[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: { where: { isActive: true }, orderBy: { priceKurus: "asc" } } },
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
    include: { variants: { where: { isActive: true }, orderBy: { priceKurus: "asc" } } },
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

export interface SubscriptionPlanSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceKurus: number;
  interval: "MONTHLY" | "YEARLY";
  features: string[];
}

/** Fiyatlandırma sayfası için aktif abonelik planlarını fiyata göre sıralı döner. */
export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlanSummary[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
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
  }));
}
