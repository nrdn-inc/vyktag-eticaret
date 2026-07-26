import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { isVariantPurchasable } from "@/lib/stock";
import { PRODUCT_BADGES, VALUE_PROPS } from "@/lib/marketing";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/visuals/Icon";
import { NfcCard, resolveCardVariant } from "@/components/visuals/NfcCard";
import { CARD_VARIANT_PHOTOS, PRODUCTS_WITH_REAL_PHOTOS } from "@/lib/product-photos";
import { ProductPhoto } from "@/components/visuals/ProductPhoto";

export const metadata: Metadata = {
  title: "Ürünler",
  description: "VYKTag NFC kartları, etiketleri ve telefon kartları. Renk ve tasarım seçenekleriyle.",
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div>
      {/* Başlık */}
      <section className="border-b border-border-soft bg-gradient-to-b from-brand/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Ürünler
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Size uygun kartı seçin
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            NFC ve QR teknolojisiyle çalışan dijital kartvizit ürünlerimiz. Tümü dkartvizit.com
            profilinize bağlanır ve ömür boyu güncel kalır.
          </p>
        </div>
      </section>

      {/* Ürün listesi */}
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6">
        {products.map((product, index) => {
          const badge = PRODUCT_BADGES[product.slug];
          const allOutOfStock = product.variants.every((v) => !isVariantPurchasable(v.stock));

          return (
            <Reveal key={product.id} delayMs={index * 90}>
              <article className="group grid gap-8 overflow-hidden rounded-3xl border border-border-soft bg-surface transition-all hover:border-brand/40 hover:shadow-xl sm:grid-cols-[300px_1fr]">
                {/* Görsel */}
                <div className="relative flex items-center justify-center bg-gradient-to-br from-brand/10 via-accent/5 to-transparent p-8">
                  {badge && (
                    <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {badge}
                    </span>
                  )}
                  <div className="tilt-card w-full max-w-[15rem]">
                    {PRODUCTS_WITH_REAL_PHOTOS.has(product.slug) ? (
                      <ProductPhoto
                        src={CARD_VARIANT_PHOTOS[resolveCardVariant(product.variants[0]?.name)]}
                        alt={`${product.name} — gerçek ürün fotoğrafı`}
                      />
                    ) : (
                      <NfcCard
                        variant={resolveCardVariant(product.variants[0]?.name)}
                        fullName="Ad Soyad"
                        title="Unvan"
                      />
                    )}
                  </div>
                </div>

                {/* İçerik */}
                <div className="flex flex-col p-6 sm:py-8 sm:pr-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold">{product.name}</h2>
                    {allOutOfStock && (
                      <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        Tükendi
                      </span>
                    )}
                  </div>
                  <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {product.description}
                  </p>

                  <div className="mt-6">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Seçenekler
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2.5">
                      {product.variants.map((variant) => (
                        <li
                          key={variant.id}
                          className="flex items-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm transition-colors hover:border-brand/50"
                        >
                          <span className="font-medium">{variant.name}</span>
                          <span className="text-zinc-300 dark:text-zinc-700">·</span>
                          <span className="font-semibold text-brand-dark">
                            {formatPriceTRY(variant.priceKurus)}
                          </span>
                          {!isVariantPurchasable(variant.stock) && (
                            <span className="text-xs text-zinc-400">(tükendi)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
                    <Link
                      href={`/urunler/${product.slug}`}
                      className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                    >
                      İncele ve sepete ekle
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3.5 w-3.5">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                    <span className="text-sm text-zinc-500">
                      {formatPriceTRY(product.minPriceKurus)}
                      {product.variants.length > 1 && "'den başlayan fiyatlarla"}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      {/* Ortak avantajlar */}
      <section className="border-t border-border-soft bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight">
            Hangi ürünü seçerseniz seçin
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent text-white">
                  <Icon name={prop.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{prop.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {prop.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
