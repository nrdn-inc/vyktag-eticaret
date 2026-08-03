import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createVariant } from "../actions";
import { VariantForm } from "../VariantForm";

export const metadata: Metadata = {
  title: "Yeni Varyant | VYKTag Yönetim",
};

export default async function NewVariantPage({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Yeni Varyant — {product.name}</h1>
      <div className="mt-6">
        <VariantForm action={createVariant.bind(null, productId)} submitLabel="Varyantı oluştur" />
      </div>
    </div>
  );
}
