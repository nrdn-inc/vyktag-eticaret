import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const WIDTH_CLASS = {
  narrow: "max-w-3xl",
  default: "max-w-4xl",
  wide: "max-w-6xl",
} as const;

export interface PageHeroProps {
  /** Başlığın üstündeki küçük, harf aralıklı marka etiketi (ör. "Ürünler"). */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  /** Metin sütununun genişliği — uzun paragraflarda `narrow` daha okunaklıdır. */
  width?: keyof typeof WIDTH_CLASS;
  /** Başlığın altına eylem butonu/rozet gibi ek içerik. */
  children?: ReactNode;
  className?: string;
}

/**
 * Tüm iç sayfaların ortak üst bandı: marka gradyanı + eyebrow + h1 + açıklama.
 *
 * Bu kalıp daha önce /urunler, /fiyatlandirma, /sss ve /hakkimizda içinde dört kez elle
 * kopyalanmıştı; /iletisim ve yasal sayfalar ise bambaşka, düz bir başlık kullanıyordu.
 * Tek kaynağa alınarak sayfadan sayfaya geçişte üst bandın kaybolması/değişmesi önlenir.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  width = "wide",
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b border-border-soft bg-gradient-to-b from-brand/10 to-transparent",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto px-4 py-16 text-center sm:px-6 sm:py-20",
          WIDTH_CLASS[width],
        )}
      >
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            {eyebrow}
          </span>
        )}
        <h1
          className={cn(
            "text-4xl font-bold tracking-tight sm:text-5xl",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
