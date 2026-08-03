"use client";

import { useEffect, useState } from "react";
import { getCrossSellSubscriptionPlan } from "@/app/actions/bundle-upsell";
import { useCart } from "@/components/CartProvider";
import { formatPriceTRY } from "@/lib/format";
import { Badge, Button } from "@/components/ui";

type BundlePlan = NonNullable<Awaited<ReturnType<typeof getCrossSellSubscriptionPlan>>>;

export function BundleUpsell() {
  // `result.key`, en son fetch edilen slug anahtarını taşır. Render sırasında mevcut
  // `hardwareProductSlugsKey` ile karşılaştırılarak "bu sonuç güncel mi" türetilir — ayrı bir
  // `loading` state'i ve onu effect içinde senkron `setState` ile açıp kapatmak gerekmez
  // (bkz. react-hooks/set-state-in-effect: bir effect'in gövdesinde senkron setState render
  // basamaklanmasına yol açar; "yükleniyor" durumunu burada olduğu gibi render'da türetmek,
  // effect'i yalnızca gerçek asenkron sonucu (bir .then callback'i içinde) yazacak şekilde
  // sadeleştirir).
  const [result, setResult] = useState<{ key: string; plan: BundlePlan | null } | null>(null);
  const { items, addItem } = useCart();

  // Sepetteki donanım ürünü slug'larının kümesi. `items` dizisinin kendisi her sepet
  // mutasyonunda (miktar +/-, kişiselleştirme, ilgisiz bir satırın eklenmesi...) yeni bir
  // referans olarak gelir (bkz. CartProvider), bu yüzden doğrudan `items`'a bağımlı bir efekt
  // slug kümesi değişmese bile her etkileşimde yeniden tetiklenir — bu da bu server action'ı
  // (canlı bir Prisma sorgusu) gereksiz yere art arda çalıştırırdı. Bunun yerine türetilmiş,
  // string olarak karşılaştırılan bu anahtara bağımlıyız; değer aynıysa efekt tekrar çalışmaz.
  const hardwareProductSlugs = Array.from(
    new Set(items.filter((item) => item.variantId).map((item) => item.productSlug)),
  );
  const hardwareProductSlugsKey = hardwareProductSlugs.join(",");
  const hasHardwareProducts = hardwareProductSlugsKey.length > 0;
  const isStale = result === null || result.key !== hardwareProductSlugsKey;
  const bundlePlan = isStale ? null : result.plan;

  useEffect(() => {
    if (!hasHardwareProducts) {
      return;
    }

    let cancelled = false;
    getCrossSellSubscriptionPlan(hardwareProductSlugs)
      .then((plan) => {
        if (!cancelled) {
          setResult({ key: hardwareProductSlugsKey, plan });
        }
      })
      .catch((error) => {
        console.error("Bundle upsell yüklenemedi:", error);
      });

    // Sepet, bu istek yanıt vermeden önce tekrar değişirse (hızlı ardışık düzenlemeler),
    // gereksiz bir setState'i engeller — yukarıdaki `key` karşılaştırması zaten yanlış
    // anahtara ait bir sonucun gösterilmesini engelliyor, bu yalnızca ek bir önlemdir.
    return () => {
      cancelled = true;
    };
    // `hardwareProductSlugs`/`hasHardwareProducts` kasıtlı olarak bağımlılık listesinde değil —
    // ikisi de yalnızca `hardwareProductSlugsKey`'den türetiliyor (yukarıdaki yorum).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hardwareProductSlugsKey]);

  if (!hasHardwareProducts || isStale || !bundlePlan) {
    return null; // Donanım ürünü yoksa, sonuç güncel değilse ya da plan yoksa UI'ı meşgul etme.
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
              <Badge variant="brand" size="sm" className="uppercase tracking-wider">
                Fırsat
              </Badge>
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
        <Button
          onClick={handleAdd}
          className="whitespace-nowrap rounded-xl py-3 shadow-lg shadow-brand/30 hover:-translate-y-0.5 hover:shadow-brand/40"
        >
          Sepete Ekle
        </Button>
      </div>
    </div>
  );
}
