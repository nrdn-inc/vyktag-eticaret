import Link from "next/link";
import type { ProductWithVariants } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";

/** Katalog/anasayfa listelerinde tek bir ürünü özet olarak gösteren kart. */
export function ProductCard({ product }: { product: ProductWithVariants }) {
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-brand/10 to-brand/30 text-2xl font-semibold text-brand-dark">
        {product.name}
      </div>
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {product.description}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-lg font-bold">
          {hasMultipleVariants ? `${formatPriceTRY(product.minPriceKurus)}'den başlayan` : formatPriceTRY(product.minPriceKurus)}
        </span>
        <Link
          href={`/urunler`}
          className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          İncele
        </Link>
      </div>
    </div>
  );
}
