import Link from "next/link";
import { getActiveProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

// ISR: sayfa statik üretilir, en fazla bu süre kadar önbellekte tutulur;
// süre dolduğunda arka planda yeniden oluşturulur (katalog güncellemeleri yansır).
export const revalidate = 300;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Kartınızı seçin",
    text: "Vyktag kart, tag veya telefon kartından size uygun olanı seçin, dilerseniz logo ve tasarımla kişiselleştirin.",
  },
  {
    step: "2",
    title: "Profilinizi kuralım",
    text: "Siparişiniz sonrası dijital kartvizit profilinizi dkartvizit.com üzerinde sizin için açar ve hazırlarız.",
  },
  {
    step: "3",
    title: "Tek dokunuşla paylaşın",
    text: "Kartınızı bir telefona yaklaştırın; iletişim bilgileriniz, sosyal hesaplarınız ve bağlantılarınız anında açılsın.",
  },
];

export default async function Home() {
  const products = await getActiveProducts();
  const featured = products.slice(0, 3);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand/10 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Kartvizit dağıtma devri bitti. Artık tek dokunuş yeterli.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Vyktag NFC kartları ile iletişim bilgilerinizi, sosyal medya hesaplarınızı ve tüm
            bağlantılarınızı saniyeler içinde paylaşın. Kağıt kartvizite gerek yok.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/urunler"
              className="rounded-full bg-brand px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Ürünleri keşfet
            </Link>
            <Link
              href="/fiyatlandirma"
              className="rounded-full border border-zinc-300 px-8 py-3 text-base font-semibold transition-colors hover:border-brand hover:text-brand dark:border-zinc-700"
            >
              Fiyatları gör
            </Link>
          </div>
        </div>
      </section>

      {/* Öne çıkan ürünler */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Ürünlerimiz</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            İhtiyacınıza göre kart, etiket veya telefon kartı.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="bg-zinc-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Nasıl çalışır?</h2>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">Üç adımda dijital kartvizitiniz hazır.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-brand px-8 py-16 text-center text-white">
          <h2 className="text-3xl font-bold tracking-tight">Dijital kartvizitinizi bugün edinin</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Kağıt israfını bırakın, tek bir kartla tüm dijital kimliğinizi yanınızda taşıyın.
          </p>
          <Link
            href="/urunler"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-base font-semibold text-brand-dark transition-colors hover:bg-zinc-100"
          >
            Hemen başla
          </Link>
        </div>
      </section>
    </div>
  );
}
