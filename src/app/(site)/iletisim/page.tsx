import type { Metadata } from "next";
import type { ReactNode } from "react";
import { legalInfo } from "@/lib/site";
import { cn } from "@/lib/cn";
import { PageHero } from "@/components/PageHero";

/** İletişim kanallarını sitenin genel kart diliyle (yüzey + yumuşak kenarlık) gösterir. */
function ContactCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border-soft bg-surface p-6 transition-colors hover:border-brand/40",
        className,
      )}
    >
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
      <div className="mt-2 leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
    </section>
  );
}

export const metadata: Metadata = {
  title: "İletişim",
  description: "VYKTag ile e-posta, telefon veya adres üzerinden iletişime geçin.",
  alternates: { canonical: "/iletisim" },
};

export default function IletisimPage() {
  return (
    <div>
      <PageHero
        eyebrow="İletişim"
        title="Bize ulaşın"
        description="Sorularınız, siparişleriniz veya iade talepleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz."
        width="narrow"
      />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <ContactCard title="E-posta">
            <a
              href={`mailto:${legalInfo.email}`}
              className="font-medium text-brand transition-colors hover:text-brand-dark"
            >
              {legalInfo.email}
            </a>
          </ContactCard>

          <ContactCard title="Telefon">
            {/* tel: bağlantısı mobilde tek dokunuşla arama başlatır; numaralardaki boşluklar
                bazı cihazlarda çevrilemediğinden href'te temizlenir. */}
            {legalInfo.phones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="block font-medium text-brand transition-colors hover:text-brand-dark"
              >
                {phone}
              </a>
            ))}
          </ContactCard>

          <ContactCard title="Adres" className="sm:col-span-2">
            {legalInfo.address}
          </ContactCard>

          <ContactCard title="Kurumsal bilgiler" className="sm:col-span-2">
            {legalInfo.companyLegalName}
            <br />
            {`Vergi Dairesi / No: ${legalInfo.taxOffice} / ${legalInfo.taxNumber}`}
          </ContactCard>
        </div>
      </div>
    </div>
  );
}
