import Image from "next/image";
import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site";
import { CartLink } from "@/components/CartLink";
import { MobileNav } from "@/components/MobileNav";

/** Tüm sayfalarda ortak üst menü: duyuru şeridi, logo, gezinme ve mağaza çağrısı. */
export function SiteHeader() {
  return (
    <>
      {/* Duyuru şeridi */}
      <div className="bg-gradient-to-r from-brand to-accent px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Tek seferlik yatırım, ömür boyu kullanım — bilgileriniz değişse de kartınız hep güncel
        kalır.
      </div>

      <header className="sticky top-0 z-40 w-full border-b border-border-soft bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image src="/logo.png" alt={`${siteConfig.name} logo`} width={36} height={36} priority />
            <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
          </Link>

          <nav className="hidden items-center gap-7 sm:flex">
            {mainNav.map((item) => {
              const navLinkClass =
                "relative text-sm font-medium text-zinc-600 transition-colors hover:text-brand dark:text-zinc-300";
              const isExternal = item.href.startsWith("http");
              return isExternal ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={navLinkClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={navLinkClass}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 lg:flex">
              <Link href="/hesap" className="transition-colors hover:text-brand">
                Hesabım
              </Link>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <Link href="/hesap/kayit" className="transition-colors hover:text-brand">
                Kayıt Ol
              </Link>
            </div>
            <CartLink />
            <Link
              href="/urunler"
              className="hidden rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-dark sm:block"
            >
              Mağaza
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>
    </>
  );
}
