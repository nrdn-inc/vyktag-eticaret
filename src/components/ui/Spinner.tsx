import { cn } from "@/lib/cn";

const SIZE_MAP = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
} as const;

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  size?: keyof typeof SIZE_MAP;
  /** Bağımsız kullanıldığında ekran okuyucu için etiket. Bir Button içinde ise Button kendi aria-busy'sini yönetir, bu prop "" bırakılabilir. */
  label?: string;
}

/**
 * Süregelen bir işlemi bildiren dönen gösterge. Azaltılmış hareket tercihinde bile döner
 * — dekoratif değil, bilgi taşıyan bir durum göstergesi olduğu için WCAG bu ayrımı ayrı tutar.
 */
export function Spinner({ size = "md", label = "Yükleniyor", className, ...props }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
      className={cn("animate-spin", SIZE_MAP[size], className)}
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}
