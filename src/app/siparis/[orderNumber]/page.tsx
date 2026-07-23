import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { formatPriceTRY } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sipariş Durumu",
};

async function getOrder(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { items: { include: { productVariant: { include: { product: true } } } } },
  });
}

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  const isPaid = order.status === OrderStatus.PAID;
  const isFailed = order.status === OrderStatus.FAILED;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      {isPaid && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-brand-dark">Siparişiniz alındı</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Ödemeniz başarıyla tamamlandı. Kart üretimi ve dijital profil kurulumu için sizinle
            e-posta üzerinden iletişime geçeceğiz.
          </p>
        </>
      )}

      {isFailed && (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Ödeme tamamlanamadı</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Ödemeniz alınamadı. Kartınızdan herhangi bir tutar çekilmediyse tekrar
            deneyebilirsiniz.
          </p>
          <Link
            href="/sepet"
            className="mt-6 inline-block rounded-full bg-brand px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Sepete dön
          </Link>
        </>
      )}

      {!isPaid && !isFailed && (
        <>
          <h1 className="text-3xl font-bold tracking-tight">Ödeme bekleniyor</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Siparişiniz oluşturuldu, ödeme sonucunu bekliyoruz. Bu sayfayı birazdan yenileyin.
          </p>
        </>
      )}

      <div className="mt-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-left dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-4 flex justify-between text-sm text-zinc-500">
          <span>Sipariş No</span>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{order.orderNumber}</span>
        </div>
        <ul className="space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>
                {item.productVariant
                  ? `${item.productVariant.product.name} (${item.productVariant.name})`
                  : "Vyktag ürünü"}{" "}
                ×{item.quantity}
              </span>
              <span className="font-medium">{formatPriceTRY(item.totalKurus)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-base font-semibold dark:border-zinc-800">
          <span>Toplam</span>
          <span>{formatPriceTRY(order.totalKurus)}</span>
        </div>
      </div>
    </div>
  );
}
