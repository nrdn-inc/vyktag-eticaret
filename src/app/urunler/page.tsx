import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";

// ISR: katalog güncellemeleri en geç bu süre içinde yansır.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ürünler",
  description: "Vyktag NFC kartları, etiketleri ve telefon kartları. Renk ve tasarım seçenekleriyle.",
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Ürünler</h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          NFC ve QR teknolojisiyle çalışan dijital kartvizit ürünlerimiz. Tümü dkartvizit.com
          profilinize bağlanır.
        </p>
      </header>

      <div className="space-y-8">
        {products.map((product) => (
          <article
            key={product.id}
            className="grid gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:grid-cols-[240px_1fr] sm:p-8"
          >
            <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-brand/30 text-xl font-semibold text-brand-dark">
              {product.name}
            </div>

            <div className="flex flex-col">
              <h2 className="text-2xl font-semibold">{product.name}</h2>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{product.description}</p>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                  Seçenekler
                </h3>
                <ul className="mt-3 flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <li
                      key={variant.id}
                      className="flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm dark:border-zinc-700"
                    >
                      <span className="font-medium">{variant.name}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="font-semibold text-brand-dark">
                        {formatPriceTRY(variant.priceKurus)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto pt-6">
                <Link
                  href={`/urunler/${product.slug}`}
                  className="inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  İncele ve sepete ekle
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
