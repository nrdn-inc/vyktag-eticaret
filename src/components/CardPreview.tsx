import { NfcCard, resolveCardVariant } from "@/components/visuals/NfcCard";

interface CardPreviewProps {
  productName: string;
  variantName: string;
  fullName: string;
  title: string;
}

/** Ürün detay sayfasında kişiselleştirme alanlarına göre canlı güncellenen kart önizlemesi. */
export function CardPreview({ productName, variantName, fullName, title }: CardPreviewProps) {
  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border-soft bg-gradient-to-br from-brand/10 via-accent/5 to-transparent p-8">
        {/* NFC dalgaları */}
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <span
              key={ring}
              className="animate-ripple absolute h-48 w-48 rounded-full border border-brand/25 sm:h-64 sm:w-64"
              style={{ animationDelay: `${ring * 0.8}s` }}
            />
          ))}
        </div>

        <div className="tilt-card relative w-full max-w-[20rem]">
          <NfcCard
            variant={resolveCardVariant(variantName)}
            fullName={fullName}
            title={title}
            shine
          />
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-500">
        {productName} · {variantName} — canlı önizleme. Gerçek ürün baskısı tasarım onayınızla
        yapılır.
      </p>
    </div>
  );
}
