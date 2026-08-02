import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  /** Başlığın üstündeki küçük, harf aralıklı marka etiketi (ör. "Nasıl çalışır?"). */
  eyebrow: string;
  title: string;
  text?: string;
  /** false: sola yaslı (iki sütunlu bölümlerde metin sütunu için). */
  centered?: boolean;
  className?: string;
}

/**
 * Sayfa içi bölüm başlığı: eyebrow + h2 + açıklama. `PageHero`'nun (sayfa başına bir kez,
 * h1) bölüm düzeyindeki karşılığıdır — aynı tipografik ölçeği paylaşırlar.
 */
export function SectionHeading({
  eyebrow,
  title,
  text,
  centered = true,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-zinc-600 dark:text-zinc-400">{text}</p>}
    </div>
  );
}
