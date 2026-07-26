import { Metadata } from "next";
import { getActiveProducts } from "@/lib/catalog";
import { BulkOrderClient } from "@/components/BulkOrderClient";

export const metadata: Metadata = {
  title: "Kurumsal Toplu Sipariş | VYKTag",
  description: "VYKTag NFC dijital kartvizitleri ile şirket personellerinize toplu olarak sipariş verin. CSV ile kolay yükleme imkanı.",
};

export const revalidate = 300; // 5 dakika

export default async function TopluSiparisPage() {
  const products = await getActiveProducts();

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <BulkOrderClient products={products} />
    </div>
  );
}
