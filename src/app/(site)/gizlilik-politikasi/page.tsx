import type { Metadata } from "next";
import { legalInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Gizlilik ve Çerez Politikası",
  description: "VYKTag mağazasında kişisel verilerin ve çerezlerin nasıl kullanıldığına ilişkin gizlilik politikası.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Gizlilik ve Çerez Politikası</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          vyktag.com.tr üzerinde kişisel verilerinizin ve çerezlerin nasıl kullanıldığını açıklar.
        </p>
      </header>

      <article className="space-y-8 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            1. Genel
          </h2>
          <p>
            Bu politika, <strong>{legalInfo.companyLegalName}</strong>{" "}
            (&quot;VYKTag&quot;) tarafından işletilen vyktag.com.tr sitesini ziyaret eden veya
            sitemizden alışveriş yapan kullanıcıların kişisel verilerinin ve çerezlerin nasıl
            toplandığını, kullanıldığını ve korunduğunu açıklar. Kişisel verilerin işlenmesine ilişkin
            ayrıntılı bilgi için{" "}
            <a href="/kvkk" className="font-medium text-brand hover:text-brand-dark">
              KVKK Aydınlatma Metni
            </a>{" "}
            sayfasını inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            2. Çerezler (Cookies)
          </h2>
          <p>Sitemizde aşağıdaki amaçlarla çerez kullanılmaktadır:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              <strong>Zorunlu çerezler:</strong>{" "}
              Sepetinizin içeriğini tarayıcınızda tutmak ve siparişin doğru şekilde tamamlanmasını
              sağlamak için kullanılır; bu çerezler olmadan site temel işlevlerini yerine getiremez.
            </li>
            <li>
              <strong>Oturum/güvenlik çerezleri:</strong>{" "}
              Admin paneline giriş yapan yetkili kullanıcıların oturumunu güvenli şekilde yönetmek
              için kullanılır.
            </li>
            <li>
              <strong>Analitik çerezler:</strong>{" "}
              Sitenin nasıl kullanıldığını (ziyaretçi sayısı, görüntülenen sayfalar gibi) anlamak ve
              hizmetlerimizi geliştirmek amacıyla Google Analytics kullanılmaktadır.
            </li>
          </ul>
          <p className="mt-3">
            Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz; ancak zorunlu
            çerezlerin engellenmesi durumunda sepet ve sipariş işlevleri düzgün çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Üçüncü Taraf Hizmet Sağlayıcılar
          </h2>
          <p>Sitemizin çalışması için aşağıdaki hizmet sağlayıcılarla veri paylaşılmaktadır:</p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>
              <strong>iyzico:</strong>{" "}
              Ödeme işlemlerinin güvenli şekilde alınması için kullanılır; kart bilgileriniz doğrudan
              iyzico altyapısında işlenir, tarafımızca görülmez veya saklanmaz.
            </li>
            <li>
              <strong>dkartvizit.com:</strong>{" "}
              Satın aldığınız karta bağlı dijital profilinizin açılması ve yönetilmesi için iletişim
              bilgileriniz bu platforma aktarılır.
            </li>
            <li>
              <strong>Hostinger:</strong>{" "}
              Sitemizin barındırma (hosting) altyapısını sağlar.
            </li>
            <li>
              <strong>Google Analytics:</strong>{" "}
              Site trafiği ve kullanım istatistiklerinin analiz edilmesi için kullanılır.
            </li>
            <li>
              <strong>Kargo firmaları:</strong>{" "}
              Siparişinizin adresinize teslim edilmesi için ad-soyad, adres ve telefon bilgileriniz
              paylaşılır.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            4. Veri Güvenliği
          </h2>
          <p>
            Kişisel verileriniz, yetkisiz erişime, kayba veya kötüye kullanıma karşı makul teknik ve
            idari tedbirlerle korunur. Sitemiz HTTPS (SSL) ile şifrelenmiş bağlantı kullanır.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            5. İletişim
          </h2>
          <p>
            {`Bu politika hakkında sorularınız için ${legalInfo.email} adresinden bizimle iletişime geçebilirsiniz.`}
          </p>
        </section>
      </article>
    </div>
  );
}
