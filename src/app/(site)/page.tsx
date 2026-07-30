import Link from "next/link";
import { getActiveProductsCached } from "@/lib/catalog";
import {
  AUDIENCES,
  CARD_FEATURES,
  FAQ,
  HOW_IT_WORKS,
  TRUST_STATS,
  VALUE_PROPS,
} from "@/lib/marketing";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/visuals/Icon";
import { ProfilePagePhoto } from "@/components/visuals/ProfilePagePhoto";

/** Bölüm başlıklarında tekrar eden üst etiket + başlık + açıklama düzeni. */
function SectionHeading({
  eyebrow,
  title,
  text,
  centered = true,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-zinc-600 dark:text-zinc-400">{text}</p>}
    </div>
  );
}

export default async function Home() {
  const products = await getActiveProductsCached();

  return (
    <div>
      <HeroCarousel />

      {/* Güven şeridi */}
      <section className="border-b border-border-soft bg-surface-muted">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-brand">
                {stat.value}
                <span className="text-lg">{stat.suffix}</span>
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Neden dijital kartvizit */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Neden VYKTag?"
            title="Kağıt kartvizitin yapamadığı her şey"
            text="Tek bir NFC kart; sınırsız güncellenebilen, ölçümlenebilen ve markanızı her zaman güncel temsil eden bir sisteme dönüşür."
          />
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {VALUE_PROPS.map((prop, index) => (
            <Reveal key={prop.title} delayMs={index * 90}>
              <div className="group h-full rounded-3xl border border-border-soft bg-surface p-7 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-accent text-white shadow-lg shadow-brand/20">
                  <Icon name={prop.icon} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{prop.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {prop.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ürünler */}
      <section className="border-y border-border-soft bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Ürünler"
                title="Size uygun kartı seçin"
                text="Kart, etiket veya telefon kartı — hepsi aynı dijital profile bağlanır."
                centered={false}
              />
              <Link
                href="/urunler"
                className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                Tümünü gör →
              </Link>
            </div>
          </Reveal>

          <div className="mt-12">
            <ProductCarousel products={products} />
          </div>
        </div>
      </section>

      {/* Dijital kartvizit sayfası */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Dijital kartvizit sayfanız"
              title="Her personel için profesyonel bir vitrin"
              text="Ziyaretçi kartı okuttuğunda saniyeler içinde tüm iletişim seçeneklerinize ulaşır. Mobil uyumlu ve marka kimliğinize göre özelleştirilebilir."
              centered={false}
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {CARD_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-zinc-700 dark:text-zinc-300">{feature}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delayMs={120}>
            <div className="relative">
              <div
                aria-hidden
                className="absolute inset-x-8 top-8 -z-10 h-72 rounded-full bg-gradient-to-br from-brand/25 to-accent/20 blur-3xl"
              />
              <ProfilePagePhoto />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="border-y border-border-soft bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="Nasıl çalışır?"
              title="Üç adımda dijital kartvizitiniz hazır"
            />
          </Reveal>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item, index) => (
              <Reveal key={item.step} delayMs={index * 120}>
                <div className="relative h-full rounded-3xl border border-border-soft bg-surface p-7">
                  <span className="text-4xl font-bold text-brand/25">{item.step}</span>
                  <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Karşılaştırma */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Karşılaştırma"
            title="Basılı kartvizit ile farkı"
            text="Aynı işi yapan iki yöntem değil; biri bir kez basılır ve eskir, diğeri sizinle birlikte güncellenir."
          />
        </Reveal>
        <Reveal delayMs={100}>
          <div className="mt-12">
            <ComparisonTable />
          </div>
        </Reveal>
      </section>

      {/* Kimler için ideal */}
      <section className="border-y border-border-soft bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <Reveal>
            <SectionHeading
              eyebrow="Kimler için ideal?"
              title="Her ekip için somut avantaj"
            />
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCES.map((audience, index) => (
              <Reveal key={audience.title} delayMs={index * 80}>
                <div className="h-full rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-brand/40">
                  <h3 className="font-semibold text-brand-dark">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {audience.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SSS özeti */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
        <Reveal>
          <SectionHeading eyebrow="SSS" title="Merak edilenler" />
        </Reveal>

        <div className="mt-12 space-y-3">
          {FAQ.slice(0, 4).map((item, index) => (
            <Reveal key={item.q} delayMs={index * 70}>
              <details className="group rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-brand/40">
                <summary className="cursor-pointer list-none font-semibold marker:content-none">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span
                      className="text-xl leading-none text-brand transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/sss" className="text-sm font-semibold text-brand hover:text-brand-dark">
            Tüm soruları gör →
          </Link>
        </div>
      </section>

      {/* Kapanış CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand via-brand-dark to-accent px-8 py-16 text-center text-white sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10 blur-2xl"
            />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
              Dijital kartvizitinizi bugün edinin
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/90">
              Kağıt israfını bırakın, tek bir kartla tüm dijital kimliğinizi yanınızda taşıyın.
              Tek seferlik yatırım, ömür boyu kullanım.
            </p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/urunler"
                className="rounded-full bg-white px-8 py-3.5 text-base font-semibold text-brand-dark transition-transform hover:-translate-y-0.5"
              >
                Hemen başla
              </Link>
              <Link
                href="/fiyatlandirma"
                className="rounded-full border border-white/40 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Planları incele
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
