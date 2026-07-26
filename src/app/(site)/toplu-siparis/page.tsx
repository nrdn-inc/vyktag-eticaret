import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/catalog";
import { TopluSiparisClient } from "./TopluSiparisClient";

export const metadata: Metadata = {
  title: "Kurumsal Toplu Sipariş | B2B",
  description: "Şirket personelleriniz için tek seferde yüzlerce VYKTag kartı sipariş edin. Excel/CSV yükleyerek saniyeler içinde sepetinize ekleyin.",
};

export default async function TopluSiparisPage() {
  const products = await getActiveProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Kurumsal Toplu Sipariş</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          Tüm şirket personeliniz için dijital kartvizitleri tek bir CSV dosyasıyla yükleyin, sepetinize saniyeler içinde ekleyin.
        </p>
      </div>

      <TopluSiparisClient products={products} />
    </div>
  );
}
