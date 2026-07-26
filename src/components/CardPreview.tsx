"use client";

import { useState } from "react";
import Image from "next/image";
import { NfcCard } from "@/components/visuals/NfcCard";
import { parseVariantAttributes, resolveVariantVisual } from "@/lib/product-variant-attributes";
import { describeCardPhoto, getCardPhoto } from "@/lib/product-photos";

type PreviewMode = "photo" | "live";

interface CardPreviewProps {
  productName: string;
  variantName: string;
  variantAttributes: unknown;
  fullName: string;
  title: string;
  logoDataUrl?: string;
}

/**
 * Ürün detay sayfasının görsel alanı. İki görünüm sunar:
 * - "Gerçek ürün": seçili kart rengi/baskı rengi/özel tasarım kombinasyonunun ön-arka stüdyo fotoğrafı.
 * - "Canlı önizleme": girilen ad/unvan/logonun anında işlendiği çizilmiş kart.
 * Kullanıcı kişiselleştirme alanlarını doldurmaya başlayınca kendiliğinden canlı önizlemeye
 * geçilir; sekmelerden manuel seçim yapıldıysa o seçim korunur.
 */
export function CardPreview({
  productName,
  variantName,
  variantAttributes,
  fullName,
  title,
  logoDataUrl,
}: CardPreviewProps) {
  const [manualMode, setManualMode] = useState<PreviewMode | null>(null);

  const attributes = parseVariantAttributes(variantAttributes);
  const { cardVariant, accent } = resolveVariantVisual({ name: variantName, attributes: variantAttributes });
  const photo = getCardPhoto(attributes);

  const hasPersonalization = Boolean(fullName.trim() || title.trim() || logoDataUrl);
  // Fotoğrafı olmayan bir kombinasyonda tek seçenek çizilmiş önizlemedir.
  const mode: PreviewMode = !photo ? "live" : (manualMode ?? (hasPersonalization ? "live" : "photo"));

  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border-soft bg-gradient-to-br from-brand/10 via-accent/5 to-transparent p-6 sm:p-8">
        {mode === "photo" && photo ? (
          <Image
            key={photo}
            src={photo}
            alt={attributes ? describeCardPhoto(attributes) : `${productName} — ${variantName}`}
            fill
            priority
            sizes="(min-width: 1024px) 32rem, 90vw"
            // Stüdyo fotoğraflarının kendi boşluğu zaten geniş; ek dolgu kartı gereksiz küçültür.
            className="animate-fade-up object-contain"
          />
        ) : (
          <>
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
                variant={cardVariant}
                accent={accent}
                fullName={fullName}
                title={title}
                logoDataUrl={logoDataUrl}
                shine
              />
            </div>
          </>
        )}
      </div>

      {photo && (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Önizleme görünümü">
          {(
            [
              { value: "photo", label: "Gerçek ürün" },
              { value: "live", label: "Canlı önizleme" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={mode === tab.value}
              onClick={() => setManualMode(tab.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                mode === tab.value
                  ? "border-brand bg-brand text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-brand dark:border-zinc-700 dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-center text-xs text-zinc-500">
        {mode === "photo"
          ? `${productName} · ${variantName} — kartın ön ve arka yüzü. Ad/unvan yazmaya başlayınca canlı önizlemeye geçilir.`
          : `${productName} · ${variantName} — canlı önizleme. Gerçek ürün baskısı tasarım onayınızla yapılır.`}
      </p>
    </div>
  );
}
