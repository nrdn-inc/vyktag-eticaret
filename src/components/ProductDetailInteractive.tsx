"use client";

import { useState } from "react";
import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { CardPreview } from "@/components/CardPreview";
import { AddToCartForm } from "@/components/AddToCartForm";

interface ProductDetailInteractiveProps {
  product: ProductWithVariants;
  /** Ürün listesindeki "Seçenekler" bağlantısından (?varyant=) gelen ön seçili varyant; verilmezse ilk varyant kullanılır. */
  initialVariantId?: string;
}

/** Ürün detay sayfasının etkileşimli kısmı: kart önizlemesi ile formun aynı state'i paylaşmasını sağlar. */
export function ProductDetailInteractive({ product, initialVariantId }: ProductDetailInteractiveProps) {
  const [variantId, setVariantId] = useState(initialVariantId ?? product.variants[0].id);
  // "Sadece Fiziksel Kart" seçeneği kaldırıldığından (bkz. AddToCartForm), bu ürün için bir
  // süre planı varsa varsayılan olarak en ucuzu (durationOptions fiyata göre artan sıralı,
  // bkz. lib/catalog/index.ts getActiveDurationOptions) seçili gelir — null yalnızca hiç
  // süre planı olmayan ürünlerde (varyant bazlı düz satın alma) anlamlıdır.
  const [durationPlanId, setDurationPlanId] = useState<string | null>(
    product.durationOptions[0]?.subscriptionPlanId ?? null,
  );
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(undefined);

  const selectedVariant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const selectedDurationPlan = product.durationOptions.find((p) => p.subscriptionPlanId === durationPlanId) ?? null;
  // `product.minPriceKurus` süreli kullanım hakkı planlarını da kapsar (vitrindeki "başlangıç
  // fiyatı" için doğru) — ama burada "Sadece Fiziksel Kart" seçiliyken gösterilecek fiyat
  // yalnızca varyantlar arasından en düşüğü olmalı, aksi halde abonelik/Sınırsız fiyatı
  // yanlışlıkla kart fiyatıymış gibi görünür.
  const minVariantPriceKurus = Math.min(...product.variants.map((v) => v.priceKurus));

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        <CardPreview
          productName={product.name}
          variantName={selectedVariant.name}
          variantAttributes={selectedVariant.attributes}
          variantImages={selectedVariant.images}
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
                ? `${formatPriceTRY(minVariantPriceKurus)}'den başlayan`
                : formatPriceTRY(minVariantPriceKurus)}
          </p>
          <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">
            {selectedDurationPlan
              ? product.subscriptionFirstCardAddon
                ? selectedDurationPlan.interval === "LIFETIME"
                  ? `${selectedDurationPlan.name}: dijital profilinize süre sınırı olmadan, tek seferlik ödemeyle kullanım hakkı verir. Dilerseniz ek ücretle fiziksel kart da ekleyebilirsiniz.`
                  : `${selectedDurationPlan.name}: dijital profilinize belirtilen süre boyunca kullanım hakkı verir. Dilerseniz ek ücretle fiziksel kart da ekleyebilirsiniz.`
                : `${selectedDurationPlan.name}: fiziksel kart gönderilmez, yalnızca dijital profilinize belirtilen süre boyunca kullanım hakkı verir.`
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
