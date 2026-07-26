"use client";

import { useState } from "react";
import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { BulkOrderUpload, type SelectedProductVariant } from "@/components/BulkOrderUpload";

export function BulkOrderClient({ products }: { products: ProductWithVariants[] }) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithVariants | null>(products[0] || null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(products[0]?.variants[0]?.id || "");

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const product = products.find((p) => p.id === e.target.value) || null;
    setSelectedProduct(product);
    if (product && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    } else {
      setSelectedVariantId("");
    }
  };

  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId) || null;

  const bulkUploadVariant: SelectedProductVariant | null =
    selectedProduct && selectedVariant
      ? {
          variantId: selectedVariant.id,
          productSlug: selectedProduct.slug,
          productName: selectedProduct.name,
          variantName: selectedVariant.name,
          priceKurus: selectedVariant.priceKurus,
        }
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Kurumsal Toplu Sipariş
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Çalışan listenizi tek bir CSV dosyasıyla yükleyin, tüm personeliniz için VYKTag ürünlerini anında oluşturup sepetinize ekleyin.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Adım 1: Ürün Seçimi */}
        <div className="lg:col-span-5">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">1. Ürün ve Model Seçimi</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="product" className="mb-1.5 block text-sm font-medium">
                  Ürün Tipi
                </label>
                <select
                  id="product"
                  className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
                  value={selectedProduct?.id || ""}
                  onChange={handleProductChange}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatPriceTRY(p.minPriceKurus)}&apos;den başlayan fiyatlarla)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && selectedProduct.variants.length > 0 && (
                <div>
                  <label htmlFor="variant" className="mb-1.5 block text-sm font-medium">
                    Model / Renk
                  </label>
                  <select
                    id="variant"
                    className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm outline-none focus:border-brand dark:border-zinc-700 dark:bg-zinc-950"
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                  >
                    {selectedProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {formatPriceTRY(v.priceKurus)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedVariant && (
                <div className="mt-6 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Birim Fiyat</p>
                    <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      {formatPriceTRY(selectedVariant.priceKurus)}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-brand/5 p-6 dark:border-zinc-800 dark:bg-brand/5">
            <h3 className="font-semibold text-brand-dark mb-2">Kurumsal Logolar Hakkında</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Toplu siparişlerde özel tasarımlar için sipariş notuna talebinizi ekleyebilirsiniz. Şirket logonuzun tüm kartlara basılması için siparişi tamamladıktan sonra, yüksek çözünürlüklü vektörel logonuzu sipariş numaranızla birlikte <strong>satis@vyktag.com.tr</strong> adresine iletmeniz yeterlidir.
            </p>
          </div>
        </div>

        {/* Adım 2: CSV Yükleme */}
        <div className="lg:col-span-7">
          <BulkOrderUpload selectedVariant={bulkUploadVariant} />
        </div>
      </div>
    </div>
  );
}
