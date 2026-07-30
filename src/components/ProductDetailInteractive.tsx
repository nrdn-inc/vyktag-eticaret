"use client";

import { useState } from "react";
import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { CardPreview } from "@/components/CardPreview";
import { AddToCartForm } from "@/components/AddToCartForm";

/** Ürün detay sayfasının etkileşimli kısmı: kart önizlemesi ile formun aynı state'i paylaşmasını sağlar. */
export function ProductDetailInteractive({ product }: { product: ProductWithVariants }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [durationPlanId, setDurationPlanId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const selectedDurationPlan = product.durationOptions.find((p) => p.subscriptionPlanId === durationPlanId) ?? null;

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        <CardPreview
          productName={product.name}
          variantName={selectedVariant.name}
          variantAttributes={selectedVariant.attributes}
          fullName={fullName}
          title={title}
          logoDataUrl={logoDataUrl}
        />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-2xl font-bold text-brand-dark">
            {selectedDurationPlan
              ? formatPriceTRY(selectedDurationPlan.priceKurus)
              : product.variants.length > 1
                ? `${formatPriceTRY(product.minPriceKurus)}'den başlayan`
                : formatPriceTRY(product.minPriceKurus)}
          </p>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {selectedDurationPlan
              ? `${selectedDurationPlan.name}: fiziksel kart gönderilmez, yalnızca dijital profilinize belirtilen süre boyunca kullanım hakkı verir.`
              : product.description}
          </p>

          <div className="mt-8">
            <AddToCartForm
              product={product}
              variantId={variantId}
              onVariantChange={setVariantId}
              durationPlanId={durationPlanId}
              onDurationPlanChange={setDurationPlanId}
              fullName={fullName}
              onFullNameChange={setFullName}
              title={title}
              onTitleChange={setTitle}
              logoDataUrl={logoDataUrl}
              onLogoChange={setLogoDataUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
