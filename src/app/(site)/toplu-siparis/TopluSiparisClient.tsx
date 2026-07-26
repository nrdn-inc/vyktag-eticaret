"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductWithVariants } from "@/lib/catalog";
import { BulkOrderUpload, type SelectedProductVariant } from "@/components/BulkOrderUpload";
import { formatPriceTRY } from "@/lib/format";

export function TopluSiparisClient({ products }: { products: ProductWithVariants[] }) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(products[0] || null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    products[0]?.variants[0]?.id || ""
  );

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const p = products.find((x) => x.id === e.target.value) || null;
    setSelectedProduct(p);
    if (p && p.variants.length > 0) {
      setSelectedVariantId(p.variants[0].id);
    } else {
      setSelectedVariantId("");
    }
  };

  const selectedVariantObj = selectedProduct?.variants.find((v) => v.id === selectedVariantId) || null;

  let selectedVariantProp: SelectedProductVariant | null = null;
  if (selectedProduct && selectedVariantObj) {
    selectedVariantProp = {
      variantId: selectedVariantObj.id,
      productSlug: selectedProduct.slug,
      productName: selectedProduct.name,
      variantName: selectedVariantObj.name,
      priceKurus: selectedVariantObj.priceKurus,
    };
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <BulkOrderUpload selectedVariant={selectedVariantProp} />
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Ürün Seçimi</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kart Modeli</label>
              <select
                value={selectedProduct?.id || ""}
                onChange={handleProductChange}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div>
                <label className="block text-sm font-medium mb-1">Renk / Varyant</label>
                <div className="space-y-2">
                  {selectedProduct.variants.map((variant) => (
                    <label
                      key={variant.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                        selectedVariantId === variant.id
                          ? "border-brand bg-brand/5 dark:bg-brand/10"
                          : "border-zinc-200 hover:border-brand/50 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="variant"
                          value={variant.id}
                          checked={selectedVariantId === variant.id}
                          onChange={(e) => setSelectedVariantId(e.target.value)}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="text-sm font-medium">{variant.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-brand">
                        {formatPriceTRY(variant.priceKurus)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-zinc-50 p-6 dark:bg-zinc-800/50">
          <h3 className="font-semibold mb-2 text-sm">Toplu Sipariş Nasıl Çalışır?</h3>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-disc pl-4">
            <li>Önce yukarıdan sipariş vermek istediğiniz VYKTag ürününü seçin.</li>
            <li>Excel'de hazırladığınız veya indirdiğiniz şablonu doldurup CSV olarak kaydedin.</li>
            <li>Dosyayı yüklediğinizde sistem personelinizi otomatik okur.</li>
            <li>Hatalı kayıtları düzeltip tüm geçerli personeli tek tıkla sepetinize ekleyebilirsiniz.</li>
            <li>Sepetinizdeki ürünler için şirket logonuz tek bir e-posta ile bizden talep edilecektir.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
