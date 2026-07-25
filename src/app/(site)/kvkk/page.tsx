import type { Metadata } from "next";
import { legalInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "VYKTag / VYK Teknoloji kişisel verilerin korunması kanunu (KVKK) aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">KVKK Aydınlatma Metni</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca veri sorumlusu
          sıfatıyla hazırlanmıştır.
        </p>
      </header>

      <article className="space-y-8 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            1. Veri Sorumlusu
          </h2>
          <p>
            İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun (&quot;Kanun&quot;)
            10. maddesi uyarınca veri sorumlusu sıfatıyla <strong>{legalInfo.companyLegalName}</strong>{" "}
            (&quot;VYKTag&quot; / &quot;Şirket&quot;) tarafından,{" "}
            {`${legalInfo.address} adresinde faaliyet gösteren şirketimizce işlenen kişisel verileriniz hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.`}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            2. İşlenen Kişisel Veriler
          </h2>
          <p>
            Sitemiz üzerinden ürün satın alırken veya bizimle iletişime geçtiğinizde; ad-soyad, T.C.
            kimlik numarası, e-posta adresi, telefon numarası, teslimat ve fatura adresi, sipariş ve
            ödeme işlem bilgileri (ödeme kartı verileri iyzico tarafından işlenir, tarafımızca
            saklanmaz) ile kartınıza eklemek istediğiniz kişiselleştirme bilgileri (isim, unvan, telefon,
            not) işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Kişisel Verilerin İşlenme Amaçları
          </h2>
          <p>
            Kişisel verileriniz; siparişlerinizin oluşturulması ve teslimatının sağlanması, ödeme
            işlemlerinin gerçekleştirilmesi, dkartvizit.com üzerinde dijital profilinizin açılması,
            müşteri ilişkileri ve destek süreçlerinin yürütülmesi, yasal yükümlülüklerimizin (fatura
            düzenleme, saklama süreleri vb.) yerine getirilmesi amaçlarıyla işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            4. Hukuki Sebep
          </h2>
          <p>
            Kişisel verileriniz, bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması,
            hukuki yükümlülüğümüzün yerine getirilmesi ve ilgili mevzuatta açıkça öngörülmesi hukuki
            sebeplerine dayanarak, Kanun&apos;un 5. ve 6. maddelerinde belirtilen kişisel veri işleme
            şartları kapsamında işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            5. Kişisel Verilerin Aktarılması
          </h2>
          <p>
            Kişisel verileriniz; siparişinizin işlenmesi için kargo firmalarına, ödeme işlemlerinin
            gerçekleştirilmesi için iyzico Ödeme Hizmetleri A.Ş.&apos;ye, dijital profilinizin açılması
            için dkartvizit.com hizmetine ve barındırma hizmeti aldığımız Hostinger&apos;a, yalnızca
            belirtilen amaçların gerçekleştirilmesi için gerekli olduğu ölçüde aktarılmaktadır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            6. Saklama Süresi
          </h2>
          <p>
            Kişisel verileriniz, ilgili mevzuatta öngörülen süreler (özellikle Vergi Usul Kanunu ve
            Türk Ticaret Kanunu uyarınca fatura ve sipariş kayıtları için 10 yıl) boyunca veya işleme
            amacının gerektirdiği süre boyunca saklanır; süre sonunda silinir, yok edilir veya
            anonimleştirilir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            7. Haklarınız
          </h2>
          <p>Kanun&apos;un 11. maddesi uyarınca herkes, veri sorumlusuna başvurarak kendisiyle ilgili;</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>kişisel veri işlenip işlenmediğini öğrenme,</li>
            <li>işlenmişse buna ilişkin bilgi talep etme,</li>
            <li>işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
            <li>yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
            <li>eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
            <li>Kanun&apos;da öngörülen şartlar çerçevesinde silinmesini/yok edilmesini isteme,</li>
            <li>düzeltme, silme ve yok etme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme,</li>
            <li>otomatik sistemlerle analiz edilmesi sonucu aleyhine bir sonuç ortaya çıkmasına itiraz etme,</li>
            <li>kanuna aykırı işlenme sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-3">haklarına sahiptir.</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            8. Başvuru Yöntemi
          </h2>
          <p>
            Yukarıda sayılan haklarınıza ilişkin taleplerinizi <strong>{legalInfo.email}</strong>{" "}
            {`adresine e-posta göndererek veya ${legalInfo.address} adresine yazılı olarak başvurarak iletebilirsiniz.`}{" "}
            Talepleriniz, niteliğine göre en kısa sürede ve en geç 30 gün içinde ücretsiz olarak
            sonuçlandırılır.
          </p>
        </section>
      </article>
    </div>
  );
}
