import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseVariantAttributes } from "@/lib/catalog/product-variant-attributes";
import { sanitizeProductImages } from "@/lib/product-image-upload";
import { updateVariant } from "../actions";
import { VariantForm } from "../VariantForm";

export const metadata: Metadata = {
  title: "Varyantı Düzenle | VYKTag Yönetim",
};

export default async function EditVariantPage({
  params,
}: {
  params: Promise<{ productId: string; variantId: string }>;
}) {
  const { productId, variantId } = await params;
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: true },
  });
  if (!variant || variant.productId !== productId) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        Varyantı Düzenle — {variant.product.name} · {variant.name}
      </h1>
      <div className="mt-6">
        <VariantForm
          action={updateVariant.bind(null, variantId)}
          submitLabel="Değişiklikleri kaydet"
          initial={{
            name: variant.name,
            sku: variant.sku,
            priceKurus: variant.priceKurus,
            stock: variant.stock,
            isActive: variant.isActive,
            attributes: parseVariantAttributes(variant.attributes),
            images: sanitizeProductImages(variant.images),
          }}
        />
      </div>
    </div>
  );
}
