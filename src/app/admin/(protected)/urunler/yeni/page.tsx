import type { Metadata } from "next";
import { createProduct } from "../actions";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = {
  title: "Yeni Ürün | VYKTag Yönetim",
};

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Yeni Ürün</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Ürünü oluşturduktan sonra varyant (renk/fiyat/stok/görsel) eklemek için düzenleme sayfasına yönlendirilirsiniz.
      </p>
      <div className="mt-6">
        <ProductForm action={createProduct} submitLabel="Ürünü oluştur" />
      </div>
    </div>
  );
}
