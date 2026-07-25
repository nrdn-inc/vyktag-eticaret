/** Dijital kartvizit sayfasındaki hızlı erişim kısayolları. */
const QUICK_ACTIONS = [
  { label: "Ara", path: "M4 5c0 8 7 15 15 15l2-3-4-2-2 2a13 13 0 0 1-6-6l2-2-2-4-3 2Z" },
  { label: "WhatsApp", path: "M4 20l1.4-4A8 8 0 1 1 9 19.2L4 20Z" },
  { label: "E-posta", path: "M3 6h18v12H3zM3 7l9 6 9-6" },
  { label: "Konum", path: "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z M12 10a1.5 1.5 0 1 0 0 .01" },
  { label: "Web", path: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3c3 3.5 3 14.5 0 18" },
  { label: "Instagram", path: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" },
];

/**
 * Ziyaretçinin kartı okuttuğunda gördüğü dijital kartvizit sayfasının telefon
 * içinde gösterilen temsili. Gerçek ekran görüntüsü yerine kullanılır.
 */
export function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative mx-auto w-[15rem] rounded-[2.25rem] border-[7px] border-zinc-900 bg-zinc-900 shadow-2xl sm:w-[16.5rem] ${className}`}
    >
      {/* Çentik */}
      <div className="absolute left-1/2 top-0 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />

      <div className="overflow-hidden rounded-[1.7rem] bg-white">
        {/* Profil başlığı */}
        <div className="relative bg-gradient-to-br from-brand to-accent px-5 pb-10 pt-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/70 bg-white/20 text-xl font-bold text-white">
            MY
          </div>
          <p className="mt-3 text-base font-bold text-white">Mehmet Yılmaz</p>
          <p className="text-xs text-white/80">Satış Direktörü · VYK Teknoloji</p>
        </div>

        {/* Rehbere ekle */}
        <div className="-mt-5 px-4">
          <div className="rounded-xl bg-zinc-900 py-2.5 text-center text-xs font-semibold text-white shadow-lg">
            Rehbere Ekle
          </div>
        </div>

        {/* Kısayol ikonları */}
        <div className="grid grid-cols-3 gap-2 px-4 py-4">
          {QUICK_ACTIONS.map((action) => (
            <div key={action.label} className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 py-2.5">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="h-4 w-4 text-brand-dark"
              >
                <path d={action.path} />
              </svg>
              <span className="text-[8px] font-medium text-zinc-600">{action.label}</span>
            </div>
          ))}
        </div>

        {/* IBAN satırı */}
        <div className="mx-4 mb-3 flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2">
          <div>
            <p className="text-[8px] uppercase tracking-wide text-zinc-400">IBAN</p>
            <p className="text-[9px] font-medium text-zinc-700">TR── ──── ──── ──── ──</p>
          </div>
          <span className="rounded bg-brand/10 px-2 py-0.5 text-[8px] font-semibold text-brand-dark">
            Kopyala
          </span>
        </div>

        {/* İstatistik şeridi */}
        <div className="mx-4 mb-4 grid grid-cols-2 gap-2">
          {[
            { value: "1.248", label: "Görüntülenme" },
            { value: "312", label: "Rehbere eklenme" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg bg-zinc-50 px-2 py-2 text-center">
              <p className="text-xs font-bold text-zinc-900">{stat.value}</p>
              <p className="text-[8px] text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
