import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import { ProductDetailInteractive } from "@/components/ProductDetailInteractive";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Ürün bulunamadı" };
  }
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <nav className="mb-8 text-sm text-zinc-500">
        <Link href="/urunler" className="hover:text-brand">
          Ürünler
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-700 dark:text-zinc-300">{product.name}</span>
      </nav>

      <ProductDetailInteractive product={product} />
    </div>
  );
}
