import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getActiveProductsCached } from "@/lib/catalog";
import { BulkOrderClient } from "@/components/BulkOrderClient";
import { B2B_ENABLED } from "@/lib/site";

export const metadata: Metadata = {
  // Kök layout'taki `template` zaten " | VYKTag" ekliyor; burada tekrar yazmak başlığı
  // "Kurumsal Toplu Sipariş | VYKTag | VYKTag" yapıyordu.
  title: "Kurumsal Toplu Sipariş",
  description: "VYKTag NFC dijital kartvizitleri ile şirket personellerinize toplu olarak sipariş verin. CSV ile kolay yükleme imkanı.",
  alternates: { canonical: "/toplu-siparis" },
};

export default async function TopluSiparisPage() {
  // Kurumsal (B2B) toplu sipariş şimdilik gizli — bkz. lib/site.ts B2B_ENABLED. Bileşen/route
  // koddan silinmedi, yalnızca vitrinden kaldırıldı; bayrak true olunca doğrudan geri döner.
  if (!B2B_ENABLED) {
    notFound();
  }

  const products = await getActiveProductsCached();

  // `bg-surface-muted`: sabit zinc-950 yerine tema token'ı — aksi halde bu sayfanın zemini
  // sitenin geri kalanından (#0a0a0a) farklı bir tonda kalıp görünür bir dikiş oluşturuyordu.
  // `min-h-screen` kaldırıldı: header+footer zaten dikey akışta, kısa içerikte gereksiz kaydırma yaratıyordu.
  return (
    <div className="bg-surface-muted">
      <BulkOrderClient products={products} />
    </div>
  );
}
