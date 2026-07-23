import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HandoffStatus, PaymentStatus } from "@/generated/prisma/client";
import { formatPriceTRY } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE_CLASSES } from "@/lib/order-status";
import { StatusForm } from "./StatusForm";
import { TrackingForm } from "./TrackingForm";
import { HandoffForm } from "./HandoffForm";

export const metadata: Metadata = {
  title: "Sipariş Detayı | Vyktag Yönetim",
};

export const dynamic = "force-dynamic";

async function getOrder(orderNumber: string) {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: {
      user: true,
      shippingAddress: true,
      billingAddress: true,
      payments: { orderBy: { createdAt: "desc" } },
      items: {
        include: {
          productVariant: { include: { product: true } },
          subscriptionPlan: true,
          handoff: { include: { provisionedBy: true } },
        },
      },
    },
  });
}

function formatPersonalization(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== null && v !== "");
  if (entries.length === 0) {
    return null;
  }
  return entries.map(([key, v]) => `${key}: ${String(v)}`).join(" · ");
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const order = await getOrder(orderNumber);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/siparisler" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
          ← Siparişler
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {order.createdAt.toLocaleString("tr-TR")} · {order.user?.fullName} ({order.user?.email})
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-500">Sipariş durumu</h2>
        <div className="mt-3">
          <StatusForm orderNumber={order.orderNumber} currentStatus={order.status} />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-500">Kargo takibi</h2>
        <div className="mt-3">
          <TrackingForm
            orderNumber={order.orderNumber}
            trackingCarrier={order.trackingCarrier}
            trackingNumber={order.trackingNumber}
          />
        </div>
        {(order.shippedAt || order.deliveredAt) && (
          <p className="mt-3 text-xs text-zinc-500">
            {order.shippedAt && <>Kargoya verildi: {order.shippedAt.toLocaleString("tr-TR")} </>}
            {order.deliveredAt && <>· Teslim edildi: {order.deliveredAt.toLocaleString("tr-TR")}</>}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-500">Ürünler</h2>
        <ul className="mt-3 space-y-4">
          {order.items.map((item) => {
            const personalization = formatPersonalization(item.personalization);
            const isPhysical = Boolean(item.productVariant);
            return (
              <li key={item.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">
                      {item.productVariant
                        ? `${item.productVariant.product.name} — ${item.productVariant.name}`
                        : item.subscriptionPlan?.name}
                      {" "}
                      ×{item.quantity}
                    </p>
                    {personalization && (
                      <p className="mt-1 text-sm text-zinc-500">Kişiselleştirme: {personalization}</p>
                    )}
                  </div>
                  <p className="font-medium">{formatPriceTRY(item.totalKurus)}</p>
                </div>

                {isPhysical && (
                  <div className="mt-3 border-t border-zinc-200 pt-3 dark:border-zinc-800">
                    <p className="text-sm font-medium">dkartvizit hesap devri</p>
                    {item.handoff?.status === HandoffStatus.PROVISIONED ? (
                      <p className="mt-1 text-sm text-emerald-600">
                        Sağlandı: {item.handoff.dkartvizitUsername} — {item.handoff.provisionedAt?.toLocaleString("tr-TR")}
                        {item.handoff.provisionedBy && <> ({item.handoff.provisionedBy.fullName})</>}
                        {item.handoff.notes && <span className="block text-zinc-500">Not: {item.handoff.notes}</span>}
                      </p>
                    ) : (
                      <>
                        <p className="mt-1 text-sm text-amber-600">Henüz sağlanmadı.</p>
                        <HandoffForm orderItemId={item.id} orderNumber={order.orderNumber} />
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-base font-semibold dark:border-zinc-800">
          <span>Toplam</span>
          <span>{formatPriceTRY(order.totalKurus)}</span>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-500">Teslimat adresi</h2>
          {order.shippingAddress ? (
            <address className="mt-2 text-sm not-italic">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              )}
              <br />
              {order.shippingAddress.district} / {order.shippingAddress.city} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.phone}
            </address>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">Adres bilgisi yok.</p>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-500">Fatura adresi</h2>
          {order.billingAddress ? (
            <address className="mt-2 text-sm not-italic">
              {order.billingAddress.fullName}
              <br />
              {order.billingAddress.addressLine1}
              {order.billingAddress.addressLine2 && (
                <>
                  <br />
                  {order.billingAddress.addressLine2}
                </>
              )}
              <br />
              {order.billingAddress.district} / {order.billingAddress.city} {order.billingAddress.postalCode}
              <br />
              {order.billingAddress.phone}
            </address>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">Adres bilgisi yok.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-500">Ödemeler</h2>
        {order.payments.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Henüz ödeme kaydı yok.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {order.payments.map((payment) => (
              <li key={payment.id} className="flex justify-between">
                <span>
                  {payment.provider} ·{" "}
                  <span
                    className={payment.status === PaymentStatus.SUCCESS ? "text-emerald-600" : "text-red-600"}
                  >
                    {payment.status}
                  </span>{" "}
                  · {payment.createdAt.toLocaleString("tr-TR")}
                </span>
                <span className="font-medium">{formatPriceTRY(payment.amountKurus)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
