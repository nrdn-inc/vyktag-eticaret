import type { CSSProperties } from "react";

export type CardVariant = "siyah" | "beyaz" | "özel";
export type CardAccent = "altin" | "gumus";

interface NfcCardProps {
  /** Kartın üzerinde görünen ad; boşsa yer tutucu gösterilir. */
  fullName?: string;
  /** Ad altındaki unvan satırı. */
  title?: string;
  /** Kart rengi/teması. */
  variant?: CardVariant;
  /** Baskı rengi (yonga ve QR vurgu rengi) — varsayılan mevcut görünümü korur. */
  accent?: CardAccent;
  /** Kart yüzeyinde soldan sağa geçen parlama animasyonu. */
  shine?: boolean;
  /** Özel Tasarım seçiliyken yüklenen logonun canlı önizlemesi (data URL). */
  logoDataUrl?: string;
  className?: string;
  style?: CSSProperties;
}

interface SurfaceTheme {
  surface: string;
  primaryText: string;
  mutedText: string;
  wave: string;
  qr: string;
}

interface AccentTheme {
  chip: string;
  chipLine: string;
}

/** Ürün varyant adını (ör. "Siyah · Altın Baskı") kart temasına eşler. */
export function resolveCardVariant(variantName: string | undefined): CardVariant {
  const normalized = (variantName ?? "").trim().toLocaleLowerCase("tr-TR");
  if (normalized.startsWith("siyah")) return "siyah";
  if (normalized.startsWith("beyaz")) return "beyaz";
  return "özel";
}

const SURFACE_THEMES: Record<CardVariant, SurfaceTheme> = {
  siyah: {
    surface: "bg-zinc-900 ring-1 ring-white/10",
    primaryText: "text-white",
    mutedText: "text-zinc-400",
    wave: "text-brand",
    qr: "bg-white/90",
  },
  beyaz: {
    surface: "bg-white ring-1 ring-zinc-200",
    primaryText: "text-zinc-900",
    mutedText: "text-zinc-500",
    wave: "text-brand-dark",
    qr: "bg-zinc-900/85",
  },
  özel: {
    surface: "bg-gradient-to-br from-brand via-brand-dark to-accent ring-1 ring-white/20",
    primaryText: "text-white",
    mutedText: "text-white/75",
    wave: "text-white",
    qr: "bg-white/90",
  },
};

// "altin" mevcut (öntanımlı) görünümü birebir korur; "gumus" gümüş varak baskı içindir.
const ACCENT_THEMES: Record<CardAccent, AccentTheme> = {
  altin: { chip: "from-amber-200 to-amber-400", chipLine: "bg-amber-700/40" },
  gumus: { chip: "from-zinc-300 to-zinc-400", chipLine: "bg-zinc-600/40" },
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

/** Kartın sol üstündeki renkli yonga grafiği. */
function Chip({ theme }: { theme: AccentTheme }) {
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
function QrGlyph({ theme }: { theme: SurfaceTheme }) {
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
 * Fiziksel VYKTag kartının görsel temsili. Ürün fotoğrafı yerine kullanılır;
 * kart rengine (variant) ve baskı rengine (accent) göre renk değiştirir, isteğe
 * bağlı olarak canlı kişiselleştirme önizlemesi sunar.
 */
export function NfcCard({
  fullName,
  title,
  variant = "özel",
  accent = "altin",
  shine = false,
  logoDataUrl,
  className = "",
  style,
}: NfcCardProps) {
  const surface = SURFACE_THEMES[variant];
  const accentTheme = ACCENT_THEMES[accent];

  return (
    <div
      style={style}
      className={`relative isolate flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl p-4 shadow-xl transition-colors duration-300 sm:p-5 ${surface.surface} ${className}`}
    >
      {shine && (
        <span
          aria-hidden
          className="animate-sheen pointer-events-none absolute inset-y-0 -left-1/3 z-10 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        />
      )}

      <div className="flex items-start justify-between">
        <Chip theme={accentTheme} />
        <NfcWaves className={`h-6 w-6 sm:h-7 sm:w-7 ${surface.wave}`} />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {logoDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- kullanıcının yerelde yüklediği data URL, next/image optimizasyonuna uygun değil.
            <img
              src={logoDataUrl}
              alt="Logo"
              className="h-8 w-8 shrink-0 rounded-md bg-white/90 object-contain p-0.5 sm:h-9 sm:w-9"
            />
          )}
          <div className="min-w-0">
            <p className={`truncate text-sm font-bold sm:text-base ${surface.primaryText}`}>
              {fullName?.trim() || "Ad Soyad"}
            </p>
            <p className={`truncate text-[11px] sm:text-xs ${surface.mutedText}`}>
              {title?.trim() || "Unvan"}
            </p>
            <p
              className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px] ${surface.mutedText}`}
            >
              VYKTag
            </p>
          </div>
        </div>
        <QrGlyph theme={surface} />
      </div>
    </div>
  );
}
