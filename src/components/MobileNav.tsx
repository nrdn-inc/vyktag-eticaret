"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mainNav } from "@/lib/site";

/**
 * Dar ekranlarda gezinme menüsü. Masaüstündeki yatay menü mobilde gizlendiği için
 * bu bileşen olmadan mobil kullanıcıların sayfalara erişimi yoktu.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  // Menü açıkken arka planın kaymasını engelle.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape ile kapat.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-zinc-600 dark:text-zinc-300"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={close}
            className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
          />

          <nav className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Menü</span>
              <button
                type="button"
                onClick={close}
                aria-label="Menüyü kapat"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border-soft"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ul className="mt-8 space-y-1">
              {mainNav.map((item) => {
                const isExternal = item.href.startsWith("http");
                const linkClass =
                  "block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-surface-muted hover:text-brand";
                return (
                  <li key={item.href}>
                    {isExternal ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={close}
                        className={linkClass}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.href} onClick={close} className={linkClass}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 space-y-1 border-t border-border-soft pt-6">
              <Link
                href="/hesap"
                onClick={close}
                className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-surface-muted hover:text-brand"
              >
                Hesabım
              </Link>
              <Link
                href="/hesap/kayit"
                onClick={close}
                className="block rounded-xl px-4 py-3 text-base font-medium transition-colors hover:bg-surface-muted hover:text-brand"
              >
                Kayıt Ol
              </Link>
            </div>

            <Link
              href="/urunler"
              onClick={close}
              className="mt-auto rounded-full bg-brand px-6 py-3.5 text-center text-base font-semibold text-white"
            >
              Mağaza
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
