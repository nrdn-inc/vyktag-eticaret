"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/admin-session";
import { CATALOG_CACHE_TAG } from "@/lib/catalog";
import { REVALIDATE_PATHS } from "@/lib/revalidate";

export interface StockActionState {
  error?: string;
  ok?: boolean;
}

export async function setVariantStock(
  variantId: string,
  _prevState: StockActionState,
  formData: FormData,
): Promise<StockActionState> {
  await verifyAdminSession();

  const raw = String(formData.get("stock") ?? "");
  const stock = Number(raw);

  if (!Number.isInteger(stock) || stock < 0) {
    return { error: "Stok 0 veya daha büyük bir tam sayı olmalı." };
  }

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

  revalidatePath("/admin/stok");
  // Vitrindeki "tükendi" durumunun anında yansıması için katalog sayfalarını da yenile.
  // `force-dynamic` altında bu route'ların kendisinde artık bir Full Route Cache girdisi
  // yok (revalidatePath'in burada yapacak bir şeyi yok) — asıl önbellek `getActiveProducts*
  // Cached`in Data Cache girdisidir. Bu bir Server Action olduğundan (ve admin kendi
  // değişikliğini hemen görmeli — "read-your-own-writes") `updateTag` kullanılır: sonraki
  // istek önbelleği beklemeden taze veriyi getirir (bkz. Next.js updateTag dokümantasyonu).
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path);
  }
  revalidatePath(`/urunler/${variant.product.slug}`);
  updateTag(CATALOG_CACHE_TAG);

  return { ok: true };
}
