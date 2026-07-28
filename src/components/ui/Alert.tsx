import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const alertVariants = cva("flex gap-3 rounded-2xl border p-4 text-sm", {
  variants: {
    variant: {
      info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200",
      success:
        "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
      warning:
        "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
      danger: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
    },
  },
  defaultVariants: { variant: "info" },
});

const DEFAULT_ICONS: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, ReactNode> = {
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5M12 8h.01" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8 12 3 3 5-6" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <path strokeLinejoin="round" d="M12 3 2 20h20L12 3Z" />
      <path strokeLinecap="round" d="M12 10v4M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M15 9l-6 6M9 9l6 6" />
    </svg>
  ),
};

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  title?: ReactNode;
  /** Varsayılan varyant ikonunu gizlemek için `false` verin, özel ikon için bir ReactNode. */
  icon?: ReactNode | false;
  onDismiss?: () => void;
}

/**
 * Satır içi bilgilendirme/hata bandı (form üstü hata özeti, sayfa içi uyarı vb.).
 * Aciliyet düzeyine göre doğru ARIA canlı bölge rolünü otomatik seçer: `danger`/`warning`
 * kullanıcının o an yaptığı şeyi kesintiye uğratacak kadar önemlidir (`role="alert"`,
 * assertive); `info`/`success` daha nazik bir bildirimdir (`role="status"`, polite).
 */
export function Alert({ variant = "info", title, icon, onDismiss, className, children, ...props }: AlertProps) {
  const resolvedIcon = icon === false ? null : (icon ?? DEFAULT_ICONS[variant ?? "info"]);
  const isUrgent = variant === "danger" || variant === "warning";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      aria-live={isUrgent ? "assertive" : "polite"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {resolvedIcon}
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-1")}>{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Kapat"
          className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
