"use client";

import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  /** Animasyonun başlamasını geciktirir (ms); listelerde kademeli giriş için. */
  delayMs?: number;
  className?: string;
}

/** Observer hiç tetiklenmezse içeriğin gizli kalmaması için son çare süresi (ms). */
const SAFETY_REVEAL_MS = 1500;

/**
 * İçeriği ekrana girdiğinde yumuşak biçimde belirtir.
 *
 * Görünürlük React state'i yerine doğrudan sınıf eklenerek yönetilir: böylece
 * gereksiz yeniden render olmaz ve giriş animasyonu tamamen sunuma ait kalır.
 *
 * ÖNEMLİ: Bu bir görsel iyileştirmedir, içeriği gizleme mekanizması değildir.
 * IntersectionObserver bazı durumlarda hiç tetiklenmez (arka plan sekmesi, karelerin
 * işlenmediği ortamlar, eski tarayıcılar). Bu yüzden üç ayrı güvenlik ağı var:
 * anında görünürlük kontrolü, kaydırma dinleyicisi ve zaman aşımı. JavaScript hiç
 * çalışmazsa layout'taki <noscript> stili devreye girer.
 */
export function Reveal({ children, delayMs = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let done = false;
    const cleanups: (() => void)[] = [];

    const reveal = () => {
      if (done) return;
      done = true;
      node.classList.add("is-visible");
      for (const cleanup of cleanups) cleanup();
      cleanups.length = 0;
    };

    const isInViewport = () => {
      const rect = node.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) reveal();
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
      );
      observer.observe(node);
      cleanups.push(() => observer.disconnect());
    }

    // Güvenlik ağı 1: mount anında zaten görünür alandaysa beklemeden göster.
    if (isInViewport()) {
      reveal();
      return;
    }

    // Güvenlik ağı 2: observer çalışmasa da kaydırma ile yakalayalım.
    const onScroll = () => {
      if (isInViewport()) reveal();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    // Güvenlik ağı 3: hiçbiri tetiklenmezse içerik yine de görünsün.
    const timer = setTimeout(reveal, SAFETY_REVEAL_MS);
    cleanups.push(() => clearTimeout(timer));

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
