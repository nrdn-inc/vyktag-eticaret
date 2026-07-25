"use client";

import { useRef, useState } from "react";
import { LOGO_DATA_URL_PATTERN, MAX_LOGO_DATA_URL_LENGTH } from "@/lib/logo-upload";

const MAX_SOURCE_FILE_BYTES = 8 * 1024 * 1024;
const MAX_DIMENSION = 400;

interface LogoUploadInputProps {
  value: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}

/**
 * Görseli her zaman <canvas> üzerinden yeniden kodlar (rasterize eder) — ham SVG asla
 * saklanmaz, çünkü <script> içerebilir. Ayrıca sonucu makul bir boyuta küçültür ki
 * personalization (Json) alanına aşırı büyük bir gövde gitmesin (bkz. lib/logo-upload.ts).
 */
function rasterizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        const naturalWidth = img.naturalWidth || 200;
        const naturalHeight = img.naturalHeight || 200;
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
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/** Özel Tasarım seçiliyken gösterilen logo yükleme + canlı önizleme kontrolü. */
export function LogoUploadInput({ value, onChange }: LogoUploadInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Lütfen bir görsel dosyası seçin (PNG, JPG, WEBP veya SVG).");
      return;
    }
    if (file.size > MAX_SOURCE_FILE_BYTES) {
      setError("Dosya çok büyük. Lütfen 8 MB'ın altında bir görsel seçin.");
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await rasterizeImageFile(file);
      if (!LOGO_DATA_URL_PATTERN.test(dataUrl) || dataUrl.length > MAX_LOGO_DATA_URL_LENGTH) {
        setError("Görsel işlenirken bir sorun oluştu. Lütfen daha küçük veya sade bir görsel deneyin.");
        return;
      }
      onChange(dataUrl);
    } catch {
      setError("Görsel yüklenemedi. Lütfen farklı bir dosya deneyin.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-semibold">Logonuz (isteğe bağlı önizleme)</label>
      <p className="mt-1 text-xs text-zinc-500">
        Kartınızda nasıl görüneceğini sipariş vermeden önce görün. Nihai baskı, sipariş
        sonrası tasarım onayınızla yapılır.
      </p>
      <div className="mt-2 flex items-center gap-3">
        {value && (
          // eslint-disable-next-line @next/next/no-img-element -- kullanıcının yerelde yüklediği data URL, next/image optimizasyonuna uygun değil.
          <img
            src={value}
            alt="Logo önizleme"
            className="h-12 w-12 rounded-md border border-zinc-300 object-contain dark:border-zinc-700"
          />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:border-brand disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
        >
          {busy ? "İşleniyor…" : value ? "Logoyu değiştir" : "Logo yükle"}
        </button>
        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Kaldır
          </button>
        )}
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
