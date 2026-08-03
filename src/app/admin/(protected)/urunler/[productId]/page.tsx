import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPriceTRY } from "@/lib/format";
import { parseVariantAttributes } from "@/lib/catalog/product-variant-attributes";
import { updateProduct } from "../actions";
import { ProductForm } from "../ProductForm";
import { toggleVariantActive } from "./varyant/actions";
import { StockForm } from "@/app/admin/(protected)/stok/StockForm";
import { ActiveToggleForm } from "@/components/admin/ActiveToggleForm";
import { Alert, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Ürünü Düzenle | VYKTag Yönetim",
};

export const dynamic = "force-dynamic";

async function getProduct(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { orderBy: { priceKurus: "asc" } } },
  });
}

export default async function EditProductPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) {
    notFound();
  }

  const structuredCount = product.variants.filter((v) => parseVariantAttributes(v.attributes) !== null).length;
  const isMixedStructure = structuredCount > 0 && structuredCount < product.variants.length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
        <div className="mt-6">
          <ProductForm
            action={updateProduct.bind(null, productId)}
            submitLabel="Değişiklikleri kaydet"
            initial={{
              name: product.name,
              slug: product.slug,
              description: product.description,
              isActive: product.isActive,
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Varyantlar</h2>
          <Link href={`/admin/urunler/${productId}/varyant/yeni`}>
            <Button variant="muted" size="sm">
              Yeni Varyant Ekle
            </Button>
          </Link>
        </div>

        {isMixedStructure && (
          <Alert variant="warning" className="mt-3">
            Bu ürünün bazı varyantlarında kart rengi/baskı rengi seçenekleri var, bazılarında yok.
            Vitrindeki renk seçicisinin çalışması için TÜM varyantların yapılandırılmış seçeneklere
            sahip olması gerekir — aksi halde düz bir liste gösterilir.
          </Alert>
        )}

        <div className="mt-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Varyant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.name}</TableCell>
                  <TableCell className="text-zinc-500">{variant.sku}</TableCell>
                  <TableCell>{formatPriceTRY(variant.priceKurus)}</TableCell>
                  <TableCell>
                    <StockForm variantId={variant.id} currentStock={variant.stock} />
                  </TableCell>
                  <TableCell>
                    <ActiveToggleForm action={toggleVariantActive.bind(null, variant.id)} isActive={variant.isActive} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/urunler/${productId}/varyant/${variant.id}`}
                      className="text-sm font-medium text-brand hover:text-brand-dark"
                    >
                      Düzenle
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {product.variants.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500">Henüz varyant eklenmedi.</p>
          )}
        </div>
      </div>
    </div>
  );
}
