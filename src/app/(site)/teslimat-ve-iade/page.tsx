import type { Metadata } from "next";
import Link from "next/link";
import { legalInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Teslimat ve İade Şartları",
  description: "Vyktag siparişlerinde teslimat süreleri ve cayma/iade koşulları.",
};

export default function TeslimatVeIadePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Teslimat ve İade Şartları</h1>
      </header>

      <article className="space-y-8 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Teslimat
          </h2>
          <p>
            Siparişleriniz, ödemenin onaylanmasının ardından hazırlanarak sipariş sırasında
            belirttiğiniz teslimat adresine kargo ile gönderilir. Standart ürünlerde kargoya
            veriliş süresi, kişiselleştirilmiş/özel tasarımlı ürünlerde ise tasarım onayı sonrası
            üretim süresi eklenerek sipariş sayfasında ve sipariş onayı e-postasında belirtilir.
          </p>
          <p className="mt-3">
            Ürün kargoya verildiğinde, kargo takip numarası siparişinizin durumu üzerinden ve
            e-posta ile tarafınıza iletilir. Kargo ücreti, sipariş özetinde ayrıca gösterilir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Cayma Hakkı ve İade
          </h2>
          <p>
            {`Alıcı; teslim aldığı tarihten itibaren ${legalInfo.withdrawalPeriodDays} gün içinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için bu süre içinde ${legalInfo.email} adresine yazılı bildirimde bulunulması yeterlidir.`}
          </p>
          <p className="mt-3">
            Cayma bildiriminin ulaşmasını takip eden 10 gün içinde ürün tarafımıza iade
            edilmelidir; cayma bildiriminin bize ulaşmasından itibaren en geç 14 gün içinde,
            ürünü teslim almış olmamız kaydıyla, tahsil edilen tüm bedel tarafınıza iade edilir.
          </p>
          <p className="mt-3">
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, isteğiniz veya kişisel
            ihtiyaçlarınız doğrultusunda hazırlanan (üzerine ad, unvan, telefon, logo veya başka
            bir kişiselleştirme işlenmiş) ürünlerde cayma hakkı kullanılamaz. Sipariş sırasında
            kişiselleştirme bilgisi girilmemiş standart ürünlerde cayma hakkı yukarıdaki koşullar
            kapsamında geçerlidir.
          </p>
          <p className="mt-3">
            Ayrıntılı hükümler için{" "}
            <Link href="/mesafeli-satis-sozlesmesi" className="font-medium text-brand hover:text-brand-dark">
              Mesafeli Satış Sözleşmesi
            </Link>
            &apos;ni inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            İletişim
          </h2>
          <p>
            Teslimat veya iade ile ilgili sorularınız için{" "}
            <a href={`mailto:${legalInfo.email}`} className="font-medium text-brand hover:text-brand-dark">
              {legalInfo.email}
            </a>{" "}
            adresinden bize ulaşabilirsiniz.
          </p>
        </section>
      </article>
    </div>
  );
}
