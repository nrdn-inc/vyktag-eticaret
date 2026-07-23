import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Vyktag NFC dijital kartvizitler hakkında sık sorulan sorular ve yanıtları.",
};

const FAQ = [
  {
    q: "Vyktag kart nasıl çalışır?",
    a: "Kartın içinde bir NFC çipi bulunur. Kartı NFC destekli bir telefona yaklaştırdığınızda, telefonda dijital kartvizit profiliniz otomatik olarak açılır. NFC desteklemeyen telefonlar için kartın üzerindeki QR kod da aynı işi görür.",
  },
  {
    q: "Dijital profilimi nasıl yönetirim?",
    a: "Kartınıza bağlı profiliniz dkartvizit.com üzerinde barındırılır. Siparişiniz sonrası hesabınızı sizin için açarız; iletişim bilgilerinizi, sosyal medya hesaplarınızı ve bağlantılarınızı buradan istediğiniz zaman güncelleyebilirsiniz.",
  },
  {
    q: "Kartıma logo veya özel tasarım ekleyebilir miyim?",
    a: "Evet. Özel Tasarım seçeneğiyle kartınıza kurumsal logonuzu ve tasarımınızı ekleyebiliriz. Sipariş sırasında tasarım tercihlerinizi belirtmeniz yeterli.",
  },
  {
    q: "Telefonuma uygulama yüklemem gerekir mi?",
    a: "Hayır. Kartınızı okutan kişinin telefonuna herhangi bir uygulama yüklemesi gerekmez; profiliniz doğrudan tarayıcıda açılır.",
  },
  {
    q: "Abonelik almak zorunda mıyım?",
    a: "Hayır. Fiziksel kart tek seferlik bir alımdır ve temel dijital profil ücretsizdir. Premium abonelik yalnızca gelişmiş analitik, sınırsız bağlantı ve özel temalar gibi ek özellikler isterseniz gereklidir.",
  },
  {
    q: "Kargo ne kadar sürer?",
    a: "Standart kartlar hazırlandıktan sonra kargoya verilir. Özel tasarımlı kartlarda tasarım onayı sonrası üretim süresi eklenir. Kargo takip numaranız siparişiniz gönderildiğinde tarafınıza iletilir.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Sıkça Sorulan Sorular</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Aradığınız yanıt burada yoksa bizimle iletişime geçebilirsiniz.
        </p>
      </header>

      <div className="space-y-4">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="group rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
              <span className="flex items-center justify-between gap-4">
                {item.q}
                <span className="text-brand transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
