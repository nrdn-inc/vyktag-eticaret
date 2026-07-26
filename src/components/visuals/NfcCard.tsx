import type { CSSProperties } from "react";

export type CardVariant = "siyah" | "beyaz" | "özel";
export type CardAccent = "altin" | "gumus" | "siyah";

interface NfcCardProps {
  /** Kartın üzerinde görünen ad; boşsa yer tutucu gösterilir. */
  fullName?: string;
  /** Ad altındaki unvan satırı. */
  title?: string;
  /** Kart rengi/teması. */
  variant?: CardVariant;
  /** Baskı rengi — karttaki tüm yazı/simge/QR bu renkle boyanır (gerçek varak baskıyı taklit eder). */
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
}

interface AccentTheme {
  /** Ad/başlık gibi ana metinler. */
  primary: string;
  /** Unvan, "VYKTag" ibaresi gibi ikincil metinler. */
  muted: string;
  /** QR deseninin dolu hücreleri. */
  qr: string;
}

/** Ürün varyant adını (ör. "Siyah · Altın Baskı") kart temasına eşler. */
export function resolveCardVariant(variantName: string | undefined): CardVariant {
  const normalized = (variantName ?? "").trim().toLocaleLowerCase("tr-TR");
  if (normalized.startsWith("siyah")) return "siyah";
  if (normalized.startsWith("beyaz")) return "beyaz";
  return "özel";
}

const SURFACE_THEMES: Record<CardVariant, SurfaceTheme> = {
  siyah: { surface: "bg-zinc-900 ring-1 ring-white/10" },
  beyaz: { surface: "bg-white ring-1 ring-zinc-200" },
  özel: { surface: "bg-gradient-to-br from-brand via-brand-dark to-accent ring-1 ring-white/20" },
};

// Gerçek varak baskıyı taklit eder: kart yüzeyinden bağımsız olarak seçilen baskı rengine
// göre karttaki TÜM yazı/simge/QR aynı tonda boyanır (yalnızca vurgu rengi değil).
const ACCENT_THEMES: Record<CardAccent, AccentTheme> = {
  altin: { primary: "text-[#EFBF04]", muted: "text-[#EFBF04]/75", qr: "bg-[#EFBF04]" },
  gumus: { primary: "text-zinc-200", muted: "text-zinc-200/75", qr: "bg-zinc-200" },
  siyah: { primary: "text-zinc-900", muted: "text-zinc-900/75", qr: "bg-zinc-900" },
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

/** Sağ alttaki dekoratif QR kod deseni (gerçek QR değil, görsel yer tutucu) — dolu hücreler baskı renginde. */
function QrGlyph({ accentTheme, className = "" }: { accentTheme: AccentTheme; className?: string }) {
  // Sabit desen: her render'da aynı görünsün diye rastgele üretilmez.
  const cells = [
    1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1,
    0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1,
  ];
  return (
    <div className={`grid grid-cols-7 gap-px ${className}`} aria-hidden>
      {cells.map((filled, index) => (
        <span key={index} className={filled ? `${accentTheme.qr} rounded-[1px]` : "bg-transparent"} />
      ))}
    </div>
  );
}

interface NfcCardBackProps {
  variant?: CardVariant;
  accent?: CardAccent;
  /** true ise arka yüzde marka etiketi yerine kullanıcının logosu/yer tutucusu gösterilir. */
  customDesign?: boolean;
  logoDataUrl?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Kartın arka yüzünün görsel temsili — gerçek ürün fotoğraflarındaki gibi NFC simgesi,
 * "Temassız Erişim / Dijital Kimlik" markası (özel tasarımda kullanıcının logosu) ve
 * belirgin bir QR koduyla.
 */
export function NfcCardBack({
  variant = "özel",
  accent = "altin",
  customDesign = false,
  logoDataUrl,
  className = "",
  style,
}: NfcCardBackProps) {
  const surface = SURFACE_THEMES[variant];
  const accentTheme = ACCENT_THEMES[accent];

  return (
    <div
      style={style}
      className={`relative isolate flex aspect-[1.586/1] w-full flex-col justify-between overflow-hidden rounded-2xl p-4 shadow-xl transition-colors duration-300 sm:p-5 ${surface.surface} ${className}`}
    >
      <NfcWaves className={`h-6 w-6 sm:h-7 sm:w-7 ${accentTheme.primary}`} />

      {customDesign ? (
        <div className="flex flex-1 items-center justify-start">
          <QrGlyph accentTheme={accentTheme} className="h-16 w-16 sm:h-20 sm:w-20" />
        </div>
      ) : (
        <div>
          <p className={`text-xs font-bold sm:text-sm ${accentTheme.primary}`}>Temassız Erişim</p>
          <p className={`text-[10px] sm:text-xs ${accentTheme.muted}`}>Dijital Kimlik</p>
          <p className={`mt-2 text-[9px] sm:text-[10px] ${accentTheme.muted}`}>www.vyktag.com</p>
        </div>
      )}

      <div className="flex items-end justify-end gap-3">
        {customDesign ? (
          logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- kullanıcının yerelde yüklediği data URL, next/image optimizasyonuna uygun değil.
            <img
              src={logoDataUrl}
              alt="Logo"
              className="h-8 w-8 shrink-0 rounded-md bg-white/90 object-contain p-0.5 sm:h-9 sm:w-9"
            />
          ) : (
            <p className={`text-[11px] font-bold uppercase tracking-wide sm:text-xs ${accentTheme.primary}`}>
              Logonuz
            </p>
          )
        ) : (
          <QrGlyph accentTheme={accentTheme} className="h-12 w-12 sm:h-14 sm:w-14" />
        )}
      </div>
    </div>
  );
}

/**
 * Fiziksel VYKTag kartının görsel temsili. Ürün fotoğrafı yerine kullanılır;
 * kart rengine (variant) göre zemin rengi, baskı rengine (accent) göre TÜM yazı/simge/QR
 * rengi değişir, isteğe bağlı olarak canlı kişiselleştirme önizlemesi sunar.
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

      <div className="flex items-start justify-end">
        <NfcWaves className={`h-6 w-6 sm:h-7 sm:w-7 ${accentTheme.primary}`} />
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
            <p className={`truncate text-sm font-bold sm:text-base ${accentTheme.primary}`}>
              {fullName?.trim() || "Ad Soyad"}
            </p>
            <p className={`truncate text-[11px] sm:text-xs ${accentTheme.muted}`}>{title?.trim() || "Unvan"}</p>
            <p className={`mt-2 text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px] ${accentTheme.muted}`}>
              VYKTag
            </p>
          </div>
        </div>
        <QrGlyph accentTheme={accentTheme} className="h-9 w-9 sm:h-11 sm:w-11" />
      </div>
    </div>
  );
}
