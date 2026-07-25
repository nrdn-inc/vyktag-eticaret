import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { verifyCustomerSession } from "@/lib/customer-session";
import { getActiveSubscriptionPlans } from "@/lib/catalog";
import { formatPriceTRY } from "@/lib/format";
import { SubscribeForm } from "./SubscribeForm";

// Giriş oturumuna ve iyzico'ya canlı istek attığından önbelleklenmemelidir.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Abone Ol",
};

function intervalSuffix(interval: "MONTHLY" | "YEARLY"): string {
  return interval === "MONTHLY" ? "/ay" : "/yıl";
}

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await verifyCustomerSession();

  const plans = await getActiveSubscriptionPlans();
  const plan = plans.find((p) => p.slug === slug);

  // Plan bulunamadıysa ya da iyzico tarafında henüz satışa açılmadıysa (purchasable: false)
  // bu akışa hiç girilemez — vitrindeki "Yakında" durumuyla tutarlı.
  if (!plan || !plan.purchasable) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{plan.name}</h1>
      <p className="mb-1 text-2xl font-semibold">
        {formatPriceTRY(plan.priceKurus)}
        <span className="text-base font-normal text-zinc-500">{intervalSuffix(plan.interval)}</span>
      </p>
      <p className="mb-8 text-sm text-zinc-500">{user.email} hesabına bağlanacak · dilediğiniz zaman iptal edebilirsiniz</p>

      <SubscribeForm slug={plan.slug} defaultGsmNumber={user.phone ?? ""} />
    </div>
  );
}
