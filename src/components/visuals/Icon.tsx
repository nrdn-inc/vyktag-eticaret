import type { IconName } from "@/lib/marketing";

/** Tek renkli (currentColor) çizgi ikon seti; pazarlama bölümlerinde kullanılır. */
const PATHS: Record<IconName, React.ReactNode> = {
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2" />
      <path d="M19 3v5h-5M5 21v-5h5" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M7 15l3.5-4 3 2.5L20 7" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-8 6-14 16-14 0 10-6 14-12 14a4 4 0 0 1-4-4Z" />
      <path d="M9 15c2-3 5-5 8-6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 8.2-7 9-4-.8-7-4.5-7-9V6l7-3Z" />
      <path d="M9.5 12l1.8 1.8 3.3-3.6" />
    </>
  ),
  contact: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6 16c.6-1.4 1.8-2 3-2s2.4.6 3 2M15 10h3M15 13.5h3" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1 0 1.7-.8 1.7-1.7 0-1.5 1-2.3 2.3-2.3H18a3 3 0 0 0 3-3c0-5.5-4-11-9-11Z" />
      <circle cx="8" cy="11" r="1" />
      <circle cx="12" cy="8" r="1" />
      <circle cx="16" cy="11" r="1" />
    </>
  ),
  bolt: <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />,
  nfc: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8.5 9a4.5 4.5 0 0 1 0 6M11.5 7a7.5 7.5 0 0 1 0 10" />
    </>
  ),
};

export function Icon({ name, className = "h-6 w-6" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
