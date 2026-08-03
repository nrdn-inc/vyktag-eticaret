import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPriceTRY } from "@/lib/format";
import { StockForm } from "./StockForm";
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Stok | VYKTag Yönetim",
};

export const dynamic = "force-dynamic";

async function getProductsWithVariants() {
  return prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: { variants: { orderBy: { priceKurus: "asc" } } },
  });
}

export default async function AdminStockPage() {
  const products = await getProductsWithVariants();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Stok</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Varyant stoklarını buradan güncelleyin. Değişiklik vitrine anında yansır.
      </p>

      <div className="mt-6 space-y-6">
        {products.map((product) => (
          <section key={product.id} className="rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800">
            <h2 className="font-semibold">{product.name}</h2>
            <div className="mt-3">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Varyant</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Stok</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        {variant.name}
                        {variant.stock <= 0 && (
                          <Badge size="sm" className="ml-2">
                            Tükendi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-zinc-500">{variant.sku}</TableCell>
                      <TableCell>{formatPriceTRY(variant.priceKurus)}</TableCell>
                      <TableCell>
                        <StockForm variantId={variant.id} currentStock={variant.stock} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
