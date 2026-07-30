import type { Metadata } from "next";
import Link from "next/link";
import { getActiveProductsCached, getActiveSubscriptionPlansCached } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { FAQ } from "@/lib/marketing";
import { Reveal } from "@/components/Reveal";
import { ComparisonTable } from "@/components/ComparisonTable";
import { NfcCard } from "@/components/visuals/NfcCard";
import { resolveCardVariant } from "@/lib/catalog/product-variant-attributes";

export const metadata: Metadata = {
  title: "Fiyatlandırma",
  description: "VYKTag kart fiyatları ve abonelik planları. Tek seferlik alım (süresiz kullanım) veya 6 aylık/yıllık abonelik.",
};

/** Abonelik periyodunu Türkçe kısa eke çevirir. */
function intervalSuffix(interval: "MONTHLY" | "SIX_MONTHS" | "YEARLY"): string {
  if (interval === "MONTHLY") return "/ay";
  if (interval === "SIX_MONTHS") return "/6 ay";
  return "/yıl";
}

export default async function PricingPage() {
  const [products, plans] = await Promise.all([
    getActiveProductsCached(),
    getActiveSubscriptionPlansCached(),
  ]);

  // En pahalı plan "önerilen" olarak vurgulanır; planlar fiyata göre artan sıralı gelir.
  const featuredPlanId = plans.at(-1)?.id;

  return (
    <div>
      {/* Başlık */}
      <section className="border-b border-border-soft bg-gradient-to-b from-brand/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Fiyatlandırma
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Tek seferlik yatırım, ömür boyu kullanım
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Fiziksel kartı bir kez satın alın, süresiz kullanım hakkına sahip olun. Dilerseniz
            kartı almadan, belirli bir süre için abonelikle de kullanabilirsiniz.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        {/* Fiziksel ürünler */}
        <section>
          <Reveal>
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Fiziksel kartlar
              </h2>
              <p className="mt-2 text-sm text-zinc-500">Tek seferlik ödeme · Kargo dahil değildir</p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {products.map((product, index) => (
              <Reveal key={product.id} delayMs={index * 90}>
                <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl">
                  <div className="bg-gradient-to-br from-brand/10 via-accent/5 to-transparent p-6">
                    <div className="mx-auto max-w-[12rem]">
                      <NfcCard
                        variant={resolveCardVariant(product.variants[0]?.name)}
                        fullName="Ad Soyad"
                        title="Unvan"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {product.description}
                    </p>
                    <p className="mt-5 text-3xl font-bold">
                      {formatPriceTRY(product.minPriceKurus)}
                      {product.variants.length > 1 && (
                        <span className="ml-1 text-sm font-normal text-zinc-500">&apos;den</span>
                      )}
                    </p>
                    <Link
                      href={`/urunler/${product.slug}`}
                      className="mt-5 rounded-full border border-brand px-6 py-2.5 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
                    >
                      Seçenekleri gör
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Abonelik planları */}
        {plans.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <div className="text-center">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Abonelik</h2>
                <p className="mt-2 text-sm text-zinc-500">
                  Kartı almadan, süreli kullanım hakkı · Dilediğiniz zaman iptal edebilirsiniz
                </p>
              </div>
            </Reveal>

            <div className="mx-auto mt-12 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
              {plans.map((plan, index) => {
                const featured = plan.id === featuredPlanId && plans.length > 1;
                return (
                  <Reveal key={plan.id} delayMs={index * 100}>
                    <div
                      className={`relative flex h-full flex-col rounded-3xl p-8 transition-all hover:-translate-y-1 ${
                        featured
                          ? "border-2 border-brand bg-surface shadow-xl shadow-brand/10"
                          : "border border-border-soft bg-surface"
                      }`}
                    >
                      {featured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                          Önerilen
                        </span>
                      )}
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {plan.description}
                      </p>
                      <p className="mt-6 text-4xl font-bold">
                        {formatPriceTRY(plan.priceKurus)}
                        <span className="text-base font-normal text-zinc-500">
                          {intervalSuffix(plan.interval)}
                        </span>
                      </p>
                      <ul className="mt-6 flex-1 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2.5 text-sm">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/urunler/vyktag-kart"
                        className={`mt-8 rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${
                          featured
                            ? "bg-brand text-white hover:bg-brand-dark"
                            : "border border-brand text-brand hover:bg-brand hover:text-white"
                        }`}
                      >
                        Başla
                      </Link>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>
        )}

        {/* Karşılaştırma */}
        <section className="mt-24">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Neden basılı kartvizitten daha ekonomik?
              </h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-400">
                Basılı kartvizit her bilgi değişikliğinde yeniden maliyet çıkarır. VYKTag&apos;te
                güncelleme ücretsizdir.
              </p>
            </div>
          </Reveal>
          <Reveal delayMs={100}>
            <div className="mt-10">
              <ComparisonTable />
            </div>
          </Reveal>
        </section>

        {/* Fiyatlandırma SSS */}
        <section className="mx-auto mt-24 max-w-3xl">
          <Reveal>
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Fiyatlandırma hakkında
            </h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {FAQ.filter((item) => /abonelik|kargo|basılı/i.test(item.q)).map((item, index) => (
              <Reveal key={item.q} delayMs={index * 80}>
                <details className="group rounded-2xl border border-border-soft bg-surface p-6">
                  <summary className="cursor-pointer list-none font-semibold marker:content-none">
                    <span className="flex items-center justify-between gap-4">
                      {item.q}
                      <span className="text-xl leading-none text-brand transition-transform group-open:rotate-45" aria-hidden>
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.a}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
