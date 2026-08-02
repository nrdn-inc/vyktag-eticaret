import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlugCached } from "@/lib/catalog";
import { ProductDetailInteractive } from "@/components/ProductDetailInteractive";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/structured-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugCached(slug);
  if (!product) {
    return { title: "Ürün bulunamadı" };
  }
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/urunler/${slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.description,
      url: `/urunler/${slug}`,
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ varyant?: string }>;
}) {
  const { slug } = await params;
  const { varyant } = await searchParams;
  const product = await getProductBySlugCached(slug);

  if (!product) {
    notFound();
  }

  // Ürün listesindeki "Seçenekler" bağlantılarından gelen ?varyant= parametresi geçerli bir
  // varyant id'sine karşılık geliyorsa sayfa o varyant seçiliyken açılır; aksi halde ilk varyant.
  const initialVariantId = product.variants.some((v) => v.id === varyant) ? varyant! : product.variants[0].id;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Fiyat aralığı + stok durumu; Google ürün sonucunda bunları doğrudan gösterebilir. */}
      <JsonLd data={productJsonLd(product)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", path: "/" },
          { name: "Ürünler", path: "/urunler" },
          { name: product.name, path: `/urunler/${product.slug}` },
        ])}
      />

      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/urunler" className="hover:text-brand">
          Ürünler
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-700 dark:text-zinc-300">{product.name}</span>
      </nav>

      <ProductDetailInteractive product={product} initialVariantId={initialVariantId} />
    </div>
  );
}
