import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProducts, getActiveSubscriptionPlans } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";

// ISR: fiyat/plan güncellemeleri en geç bu süre içinde yansır.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Fiyatlandırma",
  description: "Vyktag kart fiyatları ve premium abonelik planları. Tek seferlik alım veya aylık/yıllık abonelik.",
};

/** Abonelik periyodunu Türkçe kısa eke çevirir. */
function intervalSuffix(interval: "MONTHLY" | "YEARLY"): string {
  return interval === "MONTHLY" ? "/ay" : "/yıl";
}

export default async function PricingPage() {
  const [products, plans] = await Promise.all([
    getActiveProducts(),
    getActiveSubscriptionPlans(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Fiyatlandırma</h1>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-400">
          Fiziksel kartı bir kez satın alın; dilerseniz premium abonelik ile dijital profilinizi
          güçlendirin.
        </p>
      </header>

      {/* Fiziksel ürünler */}
      <section className="mb-20">
        <h2 className="mb-6 text-2xl font-semibold">Fiziksel kartlar (tek seferlik)</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="mt-2 flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
              <p className="mt-4 text-2xl font-bold">
                {formatPriceTRY(product.minPriceKurus)}
                {product.variants.length > 1 && (
                  <span className="text-sm font-normal text-zinc-500">&apos;den başlayan</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Abonelik planları */}
      <section>
        <h2 className="mb-6 text-2xl font-semibold">Premium abonelik</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="flex flex-col rounded-2xl border-2 border-brand/40 bg-white p-8 dark:bg-zinc-900"
            >
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{plan.description}</p>
              <p className="mt-6 text-3xl font-bold">
                {formatPriceTRY(plan.priceKurus)}
                <span className="text-base font-normal text-zinc-500">
                  {intervalSuffix(plan.interval)}
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-brand" aria-hidden>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/urunler"
                className="mt-8 rounded-full bg-brand px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Başla
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
