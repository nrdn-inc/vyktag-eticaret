"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductWithVariants } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

/** scrollLeft karşılaştırmalarında alt piksel farklarını yok saymak için tolerans. */
const SCROLL_EPSILON = 8;

/**
 * Ürünleri yatay kaydırmalı bir şeritte gösterir. Mobilde parmakla kaydırılır,
 * masaüstünde ok düğmeleriyle ilerler. Kaydırma yerel `scroll-snap` ile yapıldığı
 * için ek bir kütüphane gerekmez ve JavaScript kapalıyken de içerik erişilebilir kalır.
 *
 * Ok düğmeleri yalnızca içerik gerçekten taştığında gösterilir; şeridin boyutu
 * ResizeObserver ile izlenir (yalnızca window resize'a güvenmek, geç yüklenen yazı
 * tipleri veya değişen kart yüksekliklerinde yanlış durum bırakıyordu).
 */
export function ProductCarousel({ products }: { products: ProductWithVariants[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [overflows, setOverflows] = useState(false);

  const updateBounds = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setOverflows(maxScroll > SCROLL_EPSILON);
    setAtStart(track.scrollLeft <= SCROLL_EPSILON);
    setAtEnd(track.scrollLeft >= maxScroll - SCROLL_EPSILON);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateBounds();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateBounds);
      return () => window.removeEventListener("resize", updateBounds);
    }

    const observer = new ResizeObserver(updateBounds);
    observer.observe(track);
    // İlk kartı da izle: kart yüksekliği/genişliği değişince şerit ölçüleri değişir.
    const firstItem = track.querySelector("[data-carousel-item]");
    if (firstItem) observer.observe(firstItem);

    return () => observer.disconnect();
  }, [updateBounds]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-carousel-item]");
    const step = card instanceof HTMLElement ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const arrowClass =
    "flex h-11 w-11 items-center justify-center rounded-full border border-border-soft bg-surface text-zinc-600 transition-all hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-35 dark:text-zinc-300";

  return (
    <div className="relative">
      {overflows && (
        <div className="mb-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            disabled={atStart}
            aria-label="Önceki ürünler"
            className={arrowClass}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            disabled={atEnd}
            aria-label="Sonraki ürünler"
            className={arrowClass}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      )}

      <div
        ref={trackRef}
        onScroll={updateBounds}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-item
            className="w-[19rem] shrink-0 snap-start sm:w-[21rem]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
