"use server";

import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/orders/cart";

/**
 * Sepet veya ödeme sayfasında gösterilecek çapraz satış (cross-sell / order bump) ürününü getirir.
 * MVP aşamasında sabit olarak "vyktag-phonecard" slug'ına sahip ürünü döndürür.
 */
export async function getCrossSellProduct(): Promise<Omit<CartItem, "quantity"> | null> {
  const product = await prisma.product.findUnique({
    where: { slug: "vyktag-phonecard" },
    include: { variants: true },
  });

  if (!product || !product.isActive || product.variants.length === 0) {
    return null;
  }

  const variant = product.variants[0];

  return {
    variantId: variant.id,
    productSlug: product.slug,
    productName: product.name,
    variantName: variant.name,
    unitPriceKurus: variant.priceKurus,
  };
}
