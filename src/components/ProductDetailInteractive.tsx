"use client";

import { useState } from "react";
import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { CardPreview } from "@/components/CardPreview";
import { AddToCartForm } from "@/components/AddToCartForm";
import { ProductPhotoGallery } from "@/components/ProductPhotoGallery";
import { PRODUCTS_WITH_REAL_PHOTOS } from "@/lib/product-photos";

/** Ürün detay sayfasının etkileşimli kısmı: kart önizlemesi ile formun aynı state'i paylaşmasını sağlar. */
export function ProductDetailInteractive({ product }: { product: ProductWithVariants }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        <CardPreview
          productName={product.name}
          variantName={selectedVariant.name}
          fullName={fullName}
          title={title}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold text-brand-dark">
            {product.variants.length > 1
              ? `${formatPriceTRY(product.minPriceKurus)}'den başlayan`
              : formatPriceTRY(product.minPriceKurus)}
          </p>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">{product.description}</p>

          <div className="mt-8">
            <AddToCartForm
              product={product}
              variantId={variantId}
              onVariantChange={setVariantId}
              fullName={fullName}
              onFullNameChange={setFullName}
              title={title}
              onTitleChange={setTitle}
            />
          </div>
        </div>
      </div>

      {PRODUCTS_WITH_REAL_PHOTOS.has(product.slug) && <ProductPhotoGallery />}
    </div>
  );
}
