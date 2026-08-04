"use client";

import { useRef, useState } from "react";
import {
  MAX_IMAGES_PER_VARIANT,
  PRODUCT_IMAGE_DATA_URL_PATTERN,
  MAX_PRODUCT_IMAGE_DATA_URL_LENGTH,
} from "@/lib/product-image-upload";
import { Button } from "@/components/ui";

const MAX_SOURCE_FILE_BYTES = 15 * 1024 * 1024;
// Müşteri logosundan (400px) daha büyük — bunlar vitrindeki gerçek ürün stüdyo fotoğrafları.
const MAX_DIMENSION = 1400;

interface ProductImageUploadInputProps {
  value: string[];
  onChange: (images: string[]) => void;
  /** Ürün varyantı dışındaki kullanımlar için (ör. blog kapak görseli, maxImages=1). */
  maxImages?: number;
  label?: string;
  description?: string;
}

/**
 * Görseli her zaman <canvas> üzerinden yeniden kodlar (rasterize eder) — ham SVG asla
 * saklanmaz, çünkü <script> içerebilir. Sonucu makul bir boyuta küçültür ki
 * ProductVariant.images (Json, sınırsız) alanına aşırı büyük bir gövde gitmesin
 * (bkz. lib/product-image-upload.ts). Aynı desen: components/LogoUploadInput.tsx.
 */
function rasterizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        const naturalWidth = img.naturalWidth || 400;
        const naturalHeight = img.naturalHeight || 400;
        const scale = Math.min(1, MAX_DIMENSION / Math.max(naturalWidth, naturalHeight));
        const width = Math.max(1, Math.round(naturalWidth * scale));
        const height = Math.max(1, Math.round(naturalHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("no-canvas-context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        // JPEG + kalite 0.85: PNG'ye göre stüdyo fotoğrafı boyutunu makul tutar
        // (bkz. lib/product-image-upload.ts MAX_PRODUCT_IMAGE_DATA_URL_LENGTH).
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Ürün/varyant (veya blog kapak görseli) için admin panelinden fotoğraf yükleme, kaldırma ve sıralama kontrolü. */
export function ProductImageUploadInput({
  value,
  onChange,
  maxImages = MAX_IMAGES_PER_VARIANT,
  label = "Ürün görselleri",
  description = `İlk görsel vitrindeki birincil fotoğraf olarak kullanılır. Görsel eklenmezse müşteriye çizilmiş canlı önizleme gösterilmeye devam eder. En fazla ${MAX_IMAGES_PER_VARIANT} görsel.`,
}: ProductImageUploadInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (value.length >= maxImages) {
      setError(`En fazla ${maxImages} görsel eklenebilir.`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin (PNG, JPG veya WEBP).");
      return;
    }
    if (file.size > MAX_SOURCE_FILE_BYTES) {
      setError("Dosya çok büyük. Lütfen 15 MB'ın altında bir görsel seçin.");
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await rasterizeImageFile(file);
      if (!PRODUCT_IMAGE_DATA_URL_PATTERN.test(dataUrl) || dataUrl.length > MAX_PRODUCT_IMAGE_DATA_URL_LENGTH) {
        setError("Görsel işlenirken bir sorun oluştu. Lütfen daha küçük veya sade bir görsel deneyin.");
        return;
      }
      onChange([...value, dataUrl]);
    } catch {
      setError("Görsel yüklenemedi. Lütfen farklı bir dosya deneyin.");
    } finally {
      setBusy(false);
    }
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveTo(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <p className="mt-1 text-xs text-zinc-500">{description}</p>

      {value.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((src, index) => (
            <li key={index} className="relative rounded-lg border border-zinc-300 p-2 dark:border-zinc-700">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin'de yüklenen data URL, next/image optimizasyonuna uygun değil. */}
              <img src={src} alt={`Görsel ${index + 1}`} className="aspect-square w-full rounded-md object-contain" />
              {index === 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                  Birincil
                </span>
              )}
              <div className="mt-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="muted"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => moveTo(index, -1)}
                    aria-label="Sola/yukarı taşı"
                  >
                    ←
                  </Button>
                  <Button
                    type="button"
                    variant="muted"
                    size="sm"
                    disabled={index === value.length - 1}
                    onClick={() => moveTo(index, 1)}
                    aria-label="Sağa/aşağı taşı"
                  >
                    →
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:no-underline"
                  onClick={() => removeAt(index)}
                >
                  Kaldır
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3">
        <Button
          type="button"
          variant="muted"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy || value.length >= maxImages}
        >
          {busy ? "İşleniyor…" : "Görsel ekle"}
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
