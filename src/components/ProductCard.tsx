import Link from "next/link";
import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { isVariantPurchasable } from "@/lib/orders/stock";
import { PRODUCT_BADGES } from "@/lib/marketing";
import { NfcCard } from "@/components/visuals/NfcCard";
import { resolveCardVariant } from "@/lib/catalog/product-variant-attributes";
import { CARD_VARIANT_PHOTOS, PRODUCTS_WITH_REAL_PHOTOS } from "@/lib/catalog/product-photos";
import { ProductPhoto } from "@/components/visuals/ProductPhoto";

/** Katalog/anasayfa listelerinde tek bir ürünü özet olarak gösteren kart. */
export function ProductCard({ product }: { product: ProductWithVariants }) {
  const hasMultipleVariants = product.variants.length > 1;
  const allOutOfStock = product.variants.every((v) => !isVariantPurchasable(v.stock));
  const badge = PRODUCT_BADGES[product.slug];
  const previewVariant = resolveCardVariant(product.variants[0]?.name);
  const hasRealPhoto = PRODUCTS_WITH_REAL_PHOTOS.has(product.slug);

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-2xl hover:shadow-brand/10">
      {/* Kartın tamamını kaplayan görünmez bağlantı — varyant seçenekleri (aşağıda, kendi
          bağlantısıyla, daha yüksek z-index'te) bu genel bağlantının üzerine tıklanabilir. */}
      <Link href={`/urunler/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} />

      {/* Görsel alan */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand/10 via-accent/5 to-transparent p-8">
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
            {badge}
          </span>
        )}
        {allOutOfStock && (
          <span className="absolute right-4 top-4 z-10 rounded-full bg-zinc-900/80 px-3 py-1 text-[11px] font-semibold text-white">
            Tükendi
          </span>
        )}

        <div className="tilt-card mx-auto max-w-[15rem]">
          {hasRealPhoto ? (
            <ProductPhoto src={CARD_VARIANT_PHOTOS[previewVariant]} alt={`${product.name} — gerçek ürün fotoğrafı`} />
          ) : (
            <NfcCard variant={previewVariant} fullName="Ad Soyad" title="Unvan" />
          )}
        </div>
      </div>

      {/* Metin alan */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold transition-colors group-hover:text-brand">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {product.description}
        </p>

        {hasMultipleVariants && (
          <ul className="relative z-10 mt-4 flex flex-wrap gap-1.5">
            {product.variants.slice(0, 3).map((variant) => (
              <li key={variant.id}>
                <Link
                  href={`/urunler/${product.slug}?varyant=${variant.id}`}
                  className="block rounded-full border border-border-soft px-2.5 py-0.5 text-[11px] text-zinc-600 transition-colors hover:border-brand hover:text-brand dark:text-zinc-400"
                >
                  {variant.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-border-soft pt-4">
          <div>
            {hasMultipleVariants && (
              <span className="block text-[11px] text-zinc-500">başlangıç fiyatı</span>
            )}
            <span className="text-xl font-bold">{formatPriceTRY(product.minPriceKurus)}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-brand-dark">
            İncele
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
