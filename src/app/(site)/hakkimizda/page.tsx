import type { Metadata } from "next";
import Link from "next/link";
import { legalInfo } from "@/lib/site";
import { AUDIENCES, VALUE_PROPS } from "@/lib/marketing";
import { Reveal } from "@/components/Reveal";
import { Icon } from "@/components/visuals/Icon";
import { NfcCard } from "@/components/visuals/NfcCard";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "VYKTag, VYK Teknoloji'nin NFC dijital kartvizit markasıdır. Kim olduğumuzu ve ne yaptığımızı öğrenin.",
};

export default function HakkimizdaPage() {
  return (
    <div>
      {/* Başlık */}
      <section className="border-b border-border-soft bg-gradient-to-b from-brand/10 to-transparent">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Hakkımızda
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Kartvizitin geleceğini üretiyoruz
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {legalInfo.companyLegalName}, VYKTag markasıyla NFC teknolojisi kullanan dijital
              kartvizit ürünleri geliştiren ve satan bir teknoloji şirketidir.
            </p>
          </div>
          <div className="mx-auto w-full max-w-xs">
            <div className="animate-float">
              <NfcCard variant="özel" fullName="VYKTag" title="VYK Teknoloji" shine />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Ne yapıyoruz */}
        <Reveal>
          <section>
            <h2 className="text-2xl font-bold tracking-tight">Ne yapıyoruz?</h2>
            <div className="mt-4 space-y-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
              <p>
                Kağıt kartvizitin yerini alan, tek dokunuşla iletişim bilgilerinizi, sosyal medya
                hesaplarınızı ve tüm bağlantılarınızı paylaşmanızı sağlayan fiziksel NFC kartlar
                üretiyoruz. Her VYKTag kartı, dkartvizit.com üzerinde barındırılan bir dijital
                profile bağlıdır; siparişiniz sonrası bu profili sizin için biz açar ve hazırlarız.
              </p>
              <p>
                Ürün gamımızda standart ve kişiye özel tasarımlı kartlar, anahtarlığa takılabilen
                kompakt VYKTag Tag ve telefonun arkasına yapıştırılan VYKTag Phonecard bulunur.
                Daha fazla bilgi için{" "}
                <Link href="/urunler" className="font-medium text-brand hover:text-brand-dark">
                  ürünlerimizi
                </Link>{" "}
                inceleyebilirsiniz.
              </p>
            </div>
          </section>
        </Reveal>

        {/* Değerler */}
        <Reveal>
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">Neye önem veriyoruz?</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="rounded-2xl border border-border-soft bg-surface p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-accent text-white">
                    <Icon name={prop.icon} className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{prop.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {prop.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Kimlere hizmet veriyoruz */}
        <Reveal>
          <section className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight">Kimlere hizmet veriyoruz?</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {AUDIENCES.map((audience) => (
                <li key={audience.title} className="flex items-start gap-3 text-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span>
                    <strong className="font-semibold">{audience.title}:</strong>{" "}
                    <span className="text-zinc-600 dark:text-zinc-400">{audience.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* Kurumsal bilgiler */}
        <Reveal>
          <section className="mt-16 rounded-3xl border border-border-soft bg-surface-muted p-8">
            <h2 className="text-xl font-bold tracking-tight">Kurumsal bilgiler</h2>
            <dl className="mt-5 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">Ticaret unvanı</dt>
                <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {legalInfo.companyLegalName}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">Adres</dt>
                <dd className="mt-1 text-zinc-600 dark:text-zinc-400">{legalInfo.address}</dd>
              </div>
              <div>
                <dt className="font-semibold">Vergi dairesi / no</dt>
                <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
                  {legalInfo.taxOffice} / {legalInfo.taxNumber}
                </dd>
              </div>
              <div>
                <dt className="font-semibold">İletişim</dt>
                <dd className="mt-1 text-zinc-600 dark:text-zinc-400">
                  <a href={`mailto:${legalInfo.email}`} className="hover:text-brand">
                    {legalInfo.email}
                  </a>
                  <br />
                  {legalInfo.phones.join(" / ")}
                </dd>
              </div>
            </dl>
          </section>
        </Reveal>
      </div>
    </div>
  );
}
