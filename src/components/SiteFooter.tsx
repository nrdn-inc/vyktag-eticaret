import Image from "next/image";
import Link from "next/link";
import { legalInfo, legalNav, mainNav, siteConfig } from "@/lib/site";

/** Tüm sayfalarda ortak alt bilgi: marka, gezinme, yasal bağlantılar ve telif metni. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6">
        <div>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
          <p className="mt-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
            {siteConfig.tagline}. {siteConfig.company} markasıdır.
          </p>
          <p className="mt-3 max-w-xs text-xs text-zinc-500 dark:text-zinc-500">
            {legalInfo.companyLegalName}
            <br />
            {legalInfo.address}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Bağlantılar</h3>
          <ul className="mt-3 space-y-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Yasal</h3>
          <ul className="mt-3 space-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-zinc-600 transition-colors hover:text-brand dark:text-zinc-400"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">
            <Link href="/iletisim" className="transition-colors hover:text-brand">
              İletişim
            </Link>
          </h3>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            <a href={`mailto:${legalInfo.email}`} className="hover:text-brand">
              {legalInfo.email}
            </a>
            <br />
            {legalInfo.phones.map((phone) => (
              <span key={phone} className="block">
                {phone}
              </span>
            ))}
          </p>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            Kartınıza bağlı profilinizi{" "}
            <a
              href="https://dkartvizit.com"
              className="font-medium text-brand hover:text-brand-dark"
              target="_blank"
              rel="noopener noreferrer"
            >
              dkartvizit.com
            </a>{" "}
            üzerinden yönetirsiniz.
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-200 py-6 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:px-6">
          <div className="rounded-lg bg-white p-2">
            <Image
              src="/iyzico-logo-band.svg"
              alt="iyzico ile Öde — Visa, Mastercard, Troy, American Express"
              width={214}
              height={16}
              className="h-4 w-auto"
            />
          </div>
          <p className="text-center text-xs text-zinc-500">
            © {year} {siteConfig.company}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
