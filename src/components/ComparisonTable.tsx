import { COMPARISON } from "@/lib/marketing";

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden className="h-4 w-4 shrink-0 text-zinc-400">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-4 w-4 shrink-0 text-brand">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Basılı kartvizit ile dijital kartvizitin karşılaştırması. Geniş ekranda tablo,
 * dar ekranda karta dönüşen bir düzen kullanır (tablolar mobilde taşar).
 */
export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface">
      {/* Başlık satırı — yalnızca geniş ekranda */}
      <div className="hidden bg-surface-muted sm:grid sm:grid-cols-[1.1fr_1fr_1.3fr]">
        <div className="px-6 py-4 text-sm font-semibold text-zinc-500">Özellik</div>
        <div className="px-6 py-4 text-sm font-semibold text-zinc-500">Basılı kartvizit</div>
        <div className="flex items-center gap-2 bg-brand/10 px-6 py-4 text-sm font-semibold text-brand-dark">
          VYKTag dijital kartvizit
        </div>
      </div>

      <ul className="divide-y divide-border-soft">
        {COMPARISON.map((row) => (
          <li key={row.feature} className="sm:grid sm:grid-cols-[1.1fr_1fr_1.3fr]">
            <div className="px-6 pt-5 text-sm font-semibold sm:py-5 sm:font-medium">
              {row.feature}
            </div>
            <div className="flex items-start gap-2 px-6 pt-2 text-sm text-zinc-500 sm:py-5">
              <CrossIcon />
              <span>{row.printed}</span>
            </div>
            <div className="flex items-start gap-2 bg-brand/5 px-6 pb-5 pt-2 text-sm font-medium sm:py-5">
              <CheckIcon />
              <span>{row.digital}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
