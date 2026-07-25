"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SLIDES } from "@/lib/marketing";
import { CARD_VARIANT_PHOTOS } from "@/lib/product-photos";
import { ProductPhoto } from "@/components/visuals/ProductPhoto";

const AUTOPLAY_MS = 6000;

/**
 * Ana sayfa hero slider'ı: satın alma gerekçelerini sırayla gösterir.
 * Otomatik ilerler; kullanıcı fareyle üzerine geldiğinde veya bir kontrole
 * odaklandığında durur. `prefers-reduced-motion` açıksa otomatik geçiş yapılmaz.
 */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goTo = useCallback((next: number) => {
    setIndex(((next % HERO_SLIDES.length) + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % HERO_SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused]);

  const slide = HERO_SLIDES[index];

  return (
    <section
      className="relative overflow-hidden border-b border-border-soft bg-gradient-to-b from-brand/10 via-accent/5 to-transparent"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Öne çıkan tanıtımlar"
    >
      {/* Dekoratif arka plan ışıkları */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        {/* Metin tarafı */}
        <div key={index} className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            {slide.eyebrow}
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {slide.title}{" "}
            <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              {slide.highlight}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {slide.text}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/urunler"
              className="rounded-full bg-brand px-8 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-xl"
            >
              Kartınızı oluşturun
            </Link>
            <Link
              href="/fiyatlandirma"
              className="rounded-full border border-zinc-300 px-8 py-3.5 text-center text-base font-semibold transition-colors hover:border-brand hover:text-brand dark:border-zinc-700"
            >
              Fiyatları gör
            </Link>
          </div>

          {/* Slayt göstergeleri */}
          <div className="mt-10 flex items-center gap-2">
            {HERO_SLIDES.map((item, slideIndex) => (
              <button
                key={item.eyebrow}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`${slideIndex + 1}. tanıtıma git`}
                aria-current={slideIndex === index}
                className={`h-1.5 rounded-full transition-all ${
                  slideIndex === index
                    ? "w-10 bg-brand"
                    : "w-4 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Görsel taraf: dönen kart */}
        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div aria-hidden className="absolute inset-0 -z-10 flex items-center justify-center">
            {[0, 1, 2].map((ring) => (
              <span
                key={ring}
                className="animate-ripple absolute h-56 w-56 rounded-full border border-brand/30 sm:h-72 sm:w-72"
                style={{ animationDelay: `${ring * 0.8}s` }}
              />
            ))}
          </div>

          <div className="animate-float">
            <ProductPhoto
              key={index}
              src={CARD_VARIANT_PHOTOS[slide.variant]}
              alt="Vyktag NFC kart — gerçek ürün fotoğrafı"
              priority={index === 0}
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="animate-fade-up"
            />
          </div>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Telefonu yaklaştırın — profiliniz anında açılsın.
          </p>
        </div>
      </div>
    </section>
  );
}
