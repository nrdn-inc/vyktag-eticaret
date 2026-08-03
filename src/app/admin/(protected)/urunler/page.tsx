import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toggleProductActive } from "./actions";
import { ActiveToggleForm } from "@/components/admin/ActiveToggleForm";
import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Ürünler | VYKTag Yönetim",
};

export const dynamic = "force-dynamic";

async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { variants: true } } },
  });
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ürünler</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Ürün metinlerini, fiyatlarını, görsellerini ve seçeneklerini buradan yönetin.
          </p>
        </div>
        <Link href="/admin/urunler/yeni">
          <Button>Yeni Ürün</Button>
        </Link>
      </div>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Varyant</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-zinc-500">{product.slug}</TableCell>
                <TableCell>{product._count.variants}</TableCell>
                <TableCell>
                  <ActiveToggleForm action={toggleProductActive.bind(null, product.id)} isActive={product.isActive} />
                </TableCell>
                <TableCell>
                  <Link href={`/admin/urunler/${product.id}`} className="text-sm font-medium text-brand hover:text-brand-dark">
                    Düzenle
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
