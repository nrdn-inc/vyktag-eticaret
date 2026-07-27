import type { Metadata } from "next";
import { legalInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim",
  description: "VYKTag ile e-posta, telefon veya adres üzerinden iletişime geçin.",
};

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">İletişim</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Sorularınız, siparişleriniz veya iade talepleriniz için aşağıdaki kanallardan bize
          ulaşabilirsiniz.
        </p>
      </header>

      <article className="space-y-8 leading-relaxed text-zinc-700 dark:text-zinc-300">
        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            E-posta
          </h2>
          <p>
            <a href={`mailto:${legalInfo.email}`} className="font-medium text-brand hover:text-brand-dark">
              {legalInfo.email}
            </a>
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Telefon
          </h2>
          <p>
            {legalInfo.phones.map((phone) => (
              <span key={phone} className="block">
                {phone}
              </span>
            ))}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Adres
          </h2>
          <p>{legalInfo.address}</p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Kurumsal bilgiler
          </h2>
          <p>
            {legalInfo.companyLegalName}
            <br />
            {`Vergi Dairesi / No: ${legalInfo.taxOffice} / ${legalInfo.taxNumber}`}
          </p>
        </section>
      </article>
    </div>
  );
}
