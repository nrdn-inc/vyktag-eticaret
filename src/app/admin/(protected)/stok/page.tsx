import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPriceTRY } from "@/lib/format";
import { StockForm } from "./StockForm";

export const metadata: Metadata = {
  title: "Stok | Vyktag Yönetim",
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
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="text-zinc-500">
                  <tr>
                    <th className="py-2 font-medium">Varyant</th>
                    <th className="py-2 font-medium">SKU</th>
                    <th className="py-2 font-medium">Fiyat</th>
                    <th className="py-2 font-medium">Stok</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {product.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td className="py-3">
                        {variant.name}
                        {variant.stock <= 0 && (
                          <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            Tükendi
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-zinc-500">{variant.sku}</td>
                      <td className="py-3">{formatPriceTRY(variant.priceKurus)}</td>
                      <td className="py-3">
                        <StockForm variantId={variant.id} currentStock={variant.stock} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
