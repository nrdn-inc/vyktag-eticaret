import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { formatPriceTRY } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE_CLASSES } from "@/lib/order-status";

export const metadata: Metadata = {
  title: "Siparişler | Vyktag Yönetim",
};

export const dynamic = "force-dynamic";

async function getOrders(status: string | undefined, search: string | undefined) {
  const where: Prisma.OrderWhereInput = {};

  if (status && status in OrderStatus) {
    where.status = status as OrderStatus;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { user: { email: { contains: search } } },
      { user: { fullName: { contains: search } } },
    ];
  }

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: true },
    take: 200,
  });
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; ara?: string }>;
}) {
  const { durum, ara } = await searchParams;
  const orders = await getOrders(durum, ara);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Siparişler</h1>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="ara"
          defaultValue={ara ?? ""}
          placeholder="Sipariş no, e-posta veya ad ara…"
          className="w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          name="durum"
          defaultValue={durum ?? ""}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Filtrele
        </button>
        {(durum || ara) && (
          <Link
            href="/admin/siparisler"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Temizle
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium">Sipariş No</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Tutar</th>
              <th className="px-4 py-3 font-medium">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/siparisler/${order.orderNumber}`}
                    className="font-medium text-brand-dark hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {order.createdAt.toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-3">
                  <div>{order.user?.fullName ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{order.user?.email}</div>
                </td>
                <td className="px-4 py-3 font-medium">{formatPriceTRY(order.totalKurus)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_STATUS_BADGE_CLASSES[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                  Kriterlere uyan sipariş bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
