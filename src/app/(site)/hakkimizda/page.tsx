import type { Metadata } from "next";
import Link from "next/link";
import { legalInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Vyktag, VYK Teknoloji'nin NFC dijital kartvizit markasıdır. Kim olduğumuzu ve ne yaptığımızı öğrenin.",
};

export default function HakkimizdaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Hakkımızda</h1>
      </header>

      <article className="space-y-8 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Biz kimiz?
          </h2>
          <p>
            <strong>{legalInfo.companyLegalName}</strong>
            {`, `}
            {`Vyktag markasıyla NFC teknolojisi kullanan dijital kartvizit ürünleri geliştiren ve satan bir teknoloji şirketidir. ${legalInfo.address} adresinde faaliyet göstermekteyiz.`}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Ne yapıyoruz?
          </h2>
          <p>
            Kağıt kartvizitin yerini alan, tek dokunuşla iletişim bilgilerinizi, sosyal medya
            hesaplarınızı ve tüm bağlantılarınızı paylaşmanızı sağlayan fiziksel NFC kartlar
            üretiyoruz. Her Vyktag kartı, dkartvizit.com üzerinde barındırılan bir dijital profile
            bağlıdır; siparişiniz sonrası bu profili sizin için biz açar ve hazırlarız.
          </p>
          <p className="mt-3">
            Ürün gamımızda standart ve kişiye özel tasarımlı kartlar, anahtarlığa takılabilen
            kompakt Vyktag Tag ve telefonun arkasına yapıştırılan Vyktag Phonecard bulunur. Daha
            fazla bilgi için{" "}
            <Link href="/urunler" className="font-medium text-brand hover:text-brand-dark">
              ürünlerimizi
            </Link>{" "}
            inceleyebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Kurumsal bilgiler
          </h2>
          <p>
            <strong>Ticaret Unvanı:</strong>
            {` ${legalInfo.companyLegalName}`}
            <br />
            <strong>Adres:</strong>
            {` ${legalInfo.address}`}
            <br />
            <strong>Vergi Dairesi / No:</strong>
            {` ${legalInfo.taxOffice} / ${legalInfo.taxNumber}`}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            İletişim
          </h2>
          <p>
            Sorularınız için{" "}
            <a href={`mailto:${legalInfo.email}`} className="font-medium text-brand hover:text-brand-dark">
              {legalInfo.email}
            </a>{" "}
            {`adresinden veya ${legalInfo.phones.join(" / ")} numaralarından bize ulaşabilirsiniz.`}
          </p>
        </section>
      </article>
    </div>
  );
}
