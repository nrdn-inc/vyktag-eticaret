import Image from "next/image";
import Link from "next/link";
import { mainNav, siteConfig } from "@/lib/site";

/** Tüm sayfalarda ortak üst menü: logo, gezinme bağlantıları ve mağaza çağrısı. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt={`${siteConfig.name} logo`} width={36} height={36} priority />
          <span className="text-lg font-semibold tracking-tight">{siteConfig.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-brand dark:text-zinc-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/urunler"
          className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Mağaza
        </Link>
      </div>
    </header>
  );
}
