import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site";

/** Tüm sayfalarda ortak alt bilgi: marka, gezinme ve telif metni. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
          <p className="mt-2 max-w-xs text-sm text-zinc-600 dark:text-zinc-400">
            {siteConfig.tagline}. {siteConfig.company} markasıdır.
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
          <h3 className="text-sm font-semibold">Dijital profil</h3>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
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

      <div className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
        © {year} {siteConfig.company}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
