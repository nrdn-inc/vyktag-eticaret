import type { CSSProperties } from "react";

export type CardVariant = "siyah" | "beyaz" | "özel";

interface NfcCardProps {
  /** Kartın üzerinde görünen ad; boşsa yer tutucu gösterilir. */
  fullName?: string;
  /** Ad altındaki unvan satırı. */
  title?: string;
  /** Kart rengi/teması. */
  variant?: CardVariant;
  /** Kart yüzeyinde soldan sağa geçen parlama animasyonu. */
  shine?: boolean;
  className?: string;
  style?: CSSProperties;
}

interface VariantTheme {
  surface: string;
  primaryText: string;
  mutedText: string;
  chip: string;
  chipLine: string;
  wave: string;
  qr: string;
}

/** Ürün varyant adını (ör. "Siyah", "Özel Tasarım") kart temasına eşler. */
export function resolveCardVariant(variantName: string | undefined): CardVariant {
  const normalized = (variantName ?? "").toLocaleLowerCase("tr-TR");
  if (normalized.includes("siyah")) return "siyah";
  if (normalized.includes("beyaz")) return "beyaz";
  return "özel";
}

const THEMES: Record<CardVariant, VariantTheme> = {
  siyah: {
    surface: "bg-zinc-900 ring-1 ring-white/10",
    primaryText: "text-white",
    mutedText: "text-zinc-400",
    chip: "from-amber-200 to-amber-400",
    chipLine: "bg-amber-700/40",
    wave: "text-brand",
    qr: "bg-white/90",
  },
  beyaz: {
    surface: "bg-white ring-1 ring-zinc-200",
    primaryText: "text-zinc-900",
    mutedText: "text-zinc-500",
    chip: "from-amber-300 to-amber-500",
    chipLine: "bg-amber-700/40",
    wave: "text-brand-dark",
    qr: "bg-zinc-900/85",
  },
  özel: {
    surface: "bg-gradient-to-br from-brand via-brand-dark to-accent ring-1 ring-white/20",
    primaryText: "text-white",
    mutedText: "text-white/75",
    chip: "from-amber-200 to-amber-400",
    chipLine: "bg-amber-800/40",
    wave: "text-white",
    qr: "bg-white/90",
  },
};

/** Temassız ödeme kartlarındaki NFC dalga simgesi. */
function NfcWaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      {[5, 9.5, 14].map((radius, index) => (
        <path
          key={radius}
          d={`M${8 - index * 2} ${12 - radius / 2} a ${radius} ${radius} 0 0 1 0 ${radius}`}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity={1 - index * 0.28}
        />
      ))}
    </svg>
  );
}

/** Kartın sol üstündeki altın renkli yonga grafiği. */
function Chip({ theme }: { theme: VariantTheme }) {
  return (
    <div
      className={`relative h-6 w-8 overflow-hidden rounded-md bg-gradient-to-br ${theme.chip} sm:h-7 sm:w-10`}
    >
      <span className={`absolute left-0 top-1/2 h-px w-full ${theme.chipLine}`} />
      <span className={`absolute left-1/2 top-0 h-full w-px ${theme.chipLine}`} />
      <span className={`absolute left-1/4 top-0 h-full w-px ${theme.chipLine} opacity-60`} />
    </div>
  );
}

/** Sağ alttaki dekoratif QR kod deseni (gerçek QR değil, görsel yer tutucu). */
function QrGlyph({ theme }: { theme: VariantTheme }) {
  // Sabit desen: her render'da aynı görünsün diye rastgele üretilmez.
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1,
    0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1,
  ];
  return (
    <div className="grid h-9 w-9 grid-cols-7 gap-px sm:h-11 sm:w-11" aria-hidden>
      {cells.map((filled, index) => (
        <span
          key={index}
          className={filled ? `${theme.qr} rounded-[1px]` : "bg-transparent"}
        />
      ))}
    </div>
  );
}

/**
 * Fiziksel Vyktag kartının görsel temsili. Ürün fotoğrafı yerine kullanılır;
 * varyanta göre renk değiştirir ve isteğe bağlı olarak canlı önizleme sunar.
 */
export function NfcCard({
  fullName,
  title,
  variant = "özel",
  shine = false,
  className = "",
  style,
}: NfcCardProps) {
  const theme = THEMES[variant];

  return (
    <div
      style={style}
      className={`relative isolate flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl p-4 shadow-xl transition-colors duration-300 sm:p-5 ${theme.surface} ${className}`}
    >
      {shine && (
        <span
          aria-hidden
          className="animate-sheen pointer-events-none absolute inset-y-0 -left-1/3 z-10 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}

      <div className="flex items-start justify-between">
        <Chip theme={theme} />
        <NfcWaves className={`h-6 w-6 sm:h-7 sm:w-7 ${theme.wave}`} />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={`truncate text-sm font-bold sm:text-base ${theme.primaryText}`}>
            {fullName?.trim() || "Ad Soyad"}
          </p>
          <p className={`truncate text-[11px] sm:text-xs ${theme.mutedText}`}>
            {title?.trim() || "Unvan"}
          </p>
          <p
            className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px] ${theme.mutedText}`}
          >
            vyktag
          </p>
        </div>
        <QrGlyph theme={theme} />
      </div>
    </div>
  );
}
