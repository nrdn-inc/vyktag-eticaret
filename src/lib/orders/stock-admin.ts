import { prisma } from "@/lib/prisma";

export type UpdateVariantStockResult = { productSlug: string } | { error: string };

/**
 * Admin panelinden bir varyantın stok adedini günceller. `stock.ts`'in aksine bu dosya
 * Prisma'ya bağımlıdır ve yalnızca sunucu tarafında (admin Server Action'ı) kullanılmalıdır —
 * `stock.ts` bilinçli olarak Prisma'sız tutuluyor çünkü istemci bileşenlerinden (AddToCartForm,
 * ProductCard) de import ediliyor.
 */
export async function updateVariantStock(variantId: string, stock: number): Promise<UpdateVariantStockResult> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant) {
    return { error: "Varyant bulunamadı." };
  }

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock },
  });

  return { productSlug: variant.product.slug };
}
