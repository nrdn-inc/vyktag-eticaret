import type { Metadata } from "next";
import { legalInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Mesafeli Satış Sözleşmesi",
  description: "VYKTag mağazasından yapılan alışverişlerde geçerli mesafeli satış sözleşmesi ve cayma hakkı koşulları.",
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Mesafeli Satış Sözleşmesi</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
          uyarınca hazırlanmıştır.
        </p>
      </header>

      <article className="space-y-8 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            1. Taraflar
          </h2>
          <p>
            <strong>Satıcı:</strong>
            {` ${legalInfo.companyLegalName}`}
            <br />
            {`Adres: ${legalInfo.address}`}
            <br />
            {`Vergi Dairesi / No: ${legalInfo.taxOffice} / ${legalInfo.taxNumber}`}
            <br />
            {`E-posta: ${legalInfo.email} · Telefon: ${legalInfo.phones.join(" / ")}`}
          </p>
          <p className="mt-3">
            <strong>Alıcı:</strong>{" "}
            Sipariş sırasında sitemize bildirdiğiniz ad-soyad, adres, telefon ve e-posta bilgileriyle
            taraf olan tüketici (&quot;Alıcı&quot;). Alıcının sipariş anındaki bilgileri, siparişin bir
            parçası olarak saklanır ve işbu sözleşmenin ekini oluşturur.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            2. Sözleşmenin Konusu
          </h2>
          <p>
            İşbu sözleşmenin konusu, Alıcı&apos;nın Satıcı&apos;ya ait vyktag.com.tr internet sitesi
            üzerinden elektronik ortamda siparişini verdiği, niteliği ve satış fiyatı sipariş/ödeme
            sayfasında ve Alıcı&apos;ya iletilen sipariş onayında belirtilen ürün(ler)in satışı ve
            teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
            Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin
            belirlenmesidir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Ürün ve Ödeme Bilgileri
          </h2>
          <p>
            Ürünün türü, adedi, marka/modeli, satış bedeli (KDV dahil), ödeme şekli ve teslimat
            bilgileri, sipariş sırasında sitede gösterilen sipariş özetinde ve Alıcı&apos;ya e-posta ile
            gönderilen sipariş onayında yer alır; bu bilgiler işbu sözleşmenin ayrılmaz bir parçasıdır.
            Ödeme, iyzico altyapısı üzerinden kredi/banka kartı ile alınır; kart bilgileri Satıcı
            tarafından görülmez ve saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            4. Teslimat
          </h2>
          <p>
            Ürünler, Alıcı&apos;nın sipariş sırasında belirttiği teslimat adresine kargo ile
            gönderilir. Standart ürünlerde kargoya veriliş süresi, kişiselleştirilmiş/özel tasarımlı
            ürünlerde ise tasarım onayı sonrası üretim süresi eklenerek sipariş sayfasında ve sipariş
            onayında belirtilir. Kargo takip bilgisi, ürün kargoya verildiğinde Alıcı&apos;ya iletilir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            5. Cayma Hakkı
          </h2>
          <p>
            {`Alıcı; teslim aldığı tarihten itibaren ${legalInfo.withdrawalPeriodDays} gün içinde, hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkının kullanılması için bu süre içinde ${legalInfo.email} adresine yazılı bildirimde bulunulması yeterlidir.`}{" "}
            Cayma bildiriminin ulaşmasını takip eden 10 gün içinde ürün Satıcı&apos;ya iade edilmelidir;
            Satıcı, cayma bildiriminin kendisine ulaşmasından itibaren en geç 14 gün içinde, ürünü
            teslim almış olması kaydıyla, tahsil edilen tüm bedeli Alıcı&apos;ya iade eder.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            6. Cayma Hakkının Kullanılamayacağı Haller
          </h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca, Alıcı&apos;nın istekleri
            veya kişisel ihtiyaçları doğrultusunda hazırlanan (üzerine ad, unvan, telefon, logo veya
            başka bir kişiselleştirme işlenmiş) ürünlerde cayma hakkı kullanılamaz. Sipariş sırasında
            kişiselleştirme bilgisi girilmemiş standart ürünlerde ise cayma hakkı yukarıdaki 5. madde
            kapsamında geçerlidir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            7. Hizmet (Abonelik) Satışlarında Cayma ve İptal
          </h2>
          <p>
            VYKTag Abonelik gibi tekrarlayan (6 aylık/yıllık) abonelik hizmetlerinde cayma hakkı süresi,
            fiziksel üründen farklı olarak sözleşmenin kurulduğu tarihten itibaren işlemeye başlar
            (teslimat beklenmez). Alıcı, hizmetin ifasına onayı ile cayma süresi dolmadan
            başlanmasını talep etmişse, Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15/1-a maddesi
            uyarınca hizmet tamamen ifa edildikten sonra cayma hakkını kullanamaz.
          </p>
          <p className="mt-3">
            Abonelik, herhangi bir cezai şart olmaksızın Alıcı tarafından dilediği zaman iptal
            edilebilir. İptal, {legalInfo.email} adresine bildirim veya iyzico Abonelik altyapısı
            üzerinden yapılır; iptal talebinden sonra mevcut ödenmiş dönem sonuna kadar hizmet
            kullanılmaya devam edilir ve bir sonraki dönem için tekrar ücretlendirme yapılmaz.
            Dönem içinde kullanılan süreye ilişkin kısmi iade yapılmaz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            8. Genel Hükümler
          </h2>
          <p>
            Alıcı, sipariş onayı öncesinde ürünün temel niteliklerini, satış fiyatını, ödeme şeklini
            ve teslimat bilgilerini okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi
            verdiğini kabul eder. Ayıplı ürün, garanti ve tüketici şikayetleri için Tüketici Hakem
            Heyetleri ve Tüketici Mahkemeleri&apos;ne başvuru hakkı saklıdır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            9. Yürürlük
          </h2>
          <p>
            Alıcı, sipariş sırasında bu sözleşmeyi elektronik ortamda onaylayarak içeriğini okuduğunu
            ve kabul ettiğini beyan eder; sözleşme, siparişin oluşturulmasıyla birlikte yürürlüğe
            girer.
          </p>
        </section>
      </article>
    </div>
  );
}
