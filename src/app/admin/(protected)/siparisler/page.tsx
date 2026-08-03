import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { formatPriceTRY } from "@/lib/format";
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE_CLASSES } from "@/lib/orders/order-status";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  buttonVariants,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Siparişler | VYKTag Yönetim",
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

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <Input
          type="text"
          name="ara"
          defaultValue={ara ?? ""}
          placeholder="Sipariş no, e-posta veya ad ara…"
          aria-label="Sipariş no, e-posta veya ad ara"
          containerClassName="w-64"
        />
        <Select
          name="durum"
          defaultValue={durum ?? ""}
          aria-label="Durum"
          placeholder="Tüm durumlar"
          options={Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          containerClassName="w-48"
        />
        <Button type="submit">Filtrele</Button>
        {(durum || ara) && (
          <Link href="/admin/siparisler" className={buttonVariants({ variant: "ghost" })}>
            Temizle
          </Link>
        )}
      </form>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sipariş No</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Müşteri</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Durum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/admin/siparisler/${order.orderNumber}`}
                    className="font-medium text-brand-dark hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="text-zinc-500">{order.createdAt.toLocaleDateString("tr-TR")}</TableCell>
                <TableCell>
                  <div>{order.user?.fullName ?? "—"}</div>
                  <div className="text-xs text-zinc-500">{order.user?.email}</div>
                </TableCell>
                <TableCell className="font-medium">{formatPriceTRY(order.totalKurus)}</TableCell>
                <TableCell>
                  <Badge size="sm" className={ORDER_STATUS_BADGE_CLASSES[order.status]}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState title="Kriterlere uyan sipariş bulunamadı." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
