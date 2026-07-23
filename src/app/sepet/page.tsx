"use client";

import Link from "next/link";
import { lineKey } from "@/lib/cart";
import { formatPriceTRY } from "@/lib/format";
import { useCart } from "@/components/CartProvider";

export default function CartPage() {
  const { items, totalKurus, ready, updateQuantity, removeItem } = useCart();

  // localStorage okunana kadar boş sepet mesajını gösterme (hydration/flaş önleme).
  if (!ready) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <p className="text-zinc-500">Sepet yükleniyor…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Sepetiniz boş</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Dijital kartvizitinizi seçmek için ürünlerimize göz atın.
        </p>
        <Link
          href="/urunler"
          className="mt-8 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Ürünleri keşfet
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Sepetiniz</h1>

      <div className="space-y-4">
        {items.map((item) => {
          const key = lineKey(item);
          const personalization = item.personalization ?? {};
          const personalizationText = [
            personalization.fullName,
            personalization.title,
            personalization.phone,
            personalization.note,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <div
              key={key}
              className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">
                  {item.productName}
                  <span className="ml-2 text-sm font-normal text-zinc-500">
                    {item.variantName}
                  </span>
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatPriceTRY(item.unitPriceKurus)} / adet
                </p>
                {personalizationText && (
                  <p className="mt-2 text-xs text-zinc-500">{personalizationText}</p>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(key)}
                  className="mt-2 text-xs font-medium text-red-600 hover:underline"
                >
                  Kaldır
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-zinc-300 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => updateQuantity(key, item.quantity - 1)}
                    className="px-3 py-1.5 text-lg"
                    aria-label="Adet azalt"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(key, item.quantity + 1)}
                    className="px-3 py-1.5 text-lg"
                    aria-label="Adet artır"
                  >
                    +
                  </button>
                </div>
                <span className="w-24 text-right font-semibold">
                  {formatPriceTRY(item.unitPriceKurus * item.quantity)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toplam + ödeme */}
      <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Toplam</span>
          <span className="text-2xl font-bold">{formatPriceTRY(totalKurus)}</span>
        </div>
        <p className="mt-2 text-xs text-zinc-500">Kargo ve vergiler ödeme adımında hesaplanır.</p>
        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed rounded-full bg-zinc-300 px-8 py-3 text-sm font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
        >
          Ödemeye geç (yakında)
        </button>
      </div>
    </div>
  );
}
