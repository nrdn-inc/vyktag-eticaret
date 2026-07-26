"use client";

import { useEffect, useState } from "react";
import { getCrossSellSubscriptionPlan } from "@/app/actions/bundle-upsell";
import { useCart } from "@/components/CartProvider";
import { formatPriceTRY } from "@/lib/format";

type BundlePlan = NonNullable<Awaited<ReturnType<typeof getCrossSellSubscriptionPlan>>>;

export function BundleUpsell() {
  const [bundlePlan, setBundlePlan] = useState<BundlePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { items, addItem } = useCart();

  useEffect(() => {
    async function loadItem() {
      // Hardware product slugs currently in cart
      const productSlugs = items
        .filter((item) => item.variantId)
        .map((item) => item.productSlug);

      if (productSlugs.length === 0) {
        setBundlePlan(null);
        setLoading(false);
        return;
      }

      try {
        const plan = await getCrossSellSubscriptionPlan(productSlugs);
        setBundlePlan(plan);
      } catch (error) {
        console.error("Bundle upsell yüklenemedi:", error);
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [items]);

  if (loading || !bundlePlan) {
    return null; // Yüklenirken veya plan yoksa UI'ı meşgul etme.
  }

  // Eğer bu plan zaten sepette varsa gösterme.
  const isAlreadyInCart = items.some((item) => item.subscriptionPlanId === bundlePlan.subscriptionPlanId);
  if (isAlreadyInCart) {
    return null;
  }

  const handleAdd = () => {
    addItem({
      subscriptionPlanId: bundlePlan.subscriptionPlanId,
      productSlug: bundlePlan.planSlug,
      productName: bundlePlan.planName,
      variantName: bundlePlan.interval === "YEARLY" ? "Yıllık" : "Aylık",
      unitPriceKurus: bundlePlan.unitPriceKurus,
      quantity: 1,
    });
  };

  return (
    <div className="mt-8 rounded-2xl border-2 border-brand/40 bg-gradient-to-r from-brand/5 to-transparent p-6 shadow-sm dark:border-brand/20 dark:from-brand/10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-brand/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-brand-dark">Fırsat</span>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{bundlePlan.triggerProductName} Paketini Taçlandır</h3>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-zinc-100">{bundlePlan.planName}</strong> planına geçerek tüm pro özellikleri açın. 
              {bundlePlan.planDescription && ` (${bundlePlan.planDescription})`}
            </p>
            <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              İndirimli Fiyat: {formatPriceTRY(bundlePlan.unitPriceKurus)}
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="whitespace-nowrap rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-brand/40"
        >
          Sepete Ekle
        </button>
      </div>
    </div>
  );
}
