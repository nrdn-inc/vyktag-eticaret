import type { Metadata } from "next";
import Link from "next/link";
import { FAQ } from "@/lib/marketing";
import { legalInfo } from "@/lib/site";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { faqJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "VYKTag NFC dijital kartvizitler hakkında sık sorulan sorular ve yanıtları.",
  alternates: { canonical: "/sss" },
};

export default function FaqPage() {
  return (
    <div>
      {/* Tüm sorular sayfada görünür olduğundan tamamı işaretlenir (bkz. ana sayfadaki not). */}
      <JsonLd data={faqJsonLd(FAQ)} />

      <PageHero
        eyebrow="Yardım"
        title="Sıkça sorulan sorular"
        description="Aradığınız yanıt burada yoksa bize yazın; en kısa sürede dönüş yapalım."
        width="narrow"
      />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="space-y-3">
          {FAQ.map((item, index) => (
            <Reveal key={item.q} delayMs={index * 60}>
              <details className="group rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-brand/40">
                <summary className="cursor-pointer list-none text-lg font-semibold marker:content-none">
                  <span className="flex items-start justify-between gap-4">
                    {item.q}
                    <span
                      className="mt-0.5 text-2xl leading-none text-brand transition-transform group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 leading-relaxed text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>

        {/* İletişim kartı */}
        <Reveal>
          <div className="mt-14 rounded-3xl border border-border-soft bg-gradient-to-br from-brand/10 via-accent/5 to-transparent p-8 text-center">
            <h2 className="text-xl font-semibold">Sorunuz burada yok mu?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Kurumsal çözümler, toplu siparişler ve özel tasarım talepleri için bize doğrudan
              ulaşabilirsiniz.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href={`mailto:${legalInfo.email}`}
                className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {legalInfo.email}
              </a>
              <Link
                href="/urunler"
                className="rounded-full border border-border-soft px-6 py-3 text-sm font-semibold transition-colors hover:border-brand hover:text-brand"
              >
                Ürünleri incele
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
