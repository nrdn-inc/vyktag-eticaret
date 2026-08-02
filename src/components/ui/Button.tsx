import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

/**
 * Görsel varyantlar merkezi burada tutulur ve dışa açılır (`buttonVariants`) — böylece
 * bir `<Link>`'i buton gibi göstermek gerektiğinde (ör. anlamsal olarak gezinme olan
 * ama görsel olarak CTA gibi görünmesi gereken bir bağlantı) `<button>` semantiğini
 * bozmadan aynı sınıfları üretmek yeterlidir: `<Link className={buttonVariants({variant:"outline"})}>`.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-brand text-white hover:bg-brand-dark",
        secondary: "bg-accent text-white hover:bg-accent-dark",
        outline:
          "border border-brand text-brand hover:bg-brand hover:text-white",
        /**
         * Sayfalarda "outline"dan ayrı, tekrar eden bir ikincil CTA kalıbı vardı: nötr
         * kenarlık, dolgu değil yalnızca metin/kenarlık rengi marka rengine döner (ör. hero
         * bandındaki "Fiyatları gör", "İncele" gibi birincil CTA'nın yanındaki ikinci seçenek).
         * `outline` bunu karşılamaz çünkü hover'da dolduruyor — bu yüzden kopyala-yapıştır
         * yerine üçüncü bir varyant olarak eklendi.
         */
        muted:
          "border border-zinc-300 text-zinc-900 hover:border-brand hover:text-brand dark:border-zinc-700 dark:text-zinc-100",
        ghost: "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        link: "rounded-none px-0 py-0 text-brand underline-offset-4 hover:underline",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3 text-base",
        icon: "h-10 w-10 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** İşlem sürerken buton kilitlenir, spinner gösterilir ve aria-busy işaretlenir. */
  loading?: boolean;
  /** loading=true iken children yerine gösterilecek metin (ör. "Kaydediliyor…"). Verilmezse children korunur. */
  loadingText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * Uygulamadaki tüm birincil eylem butonları için tek kaynak.
 *
 * Varsayılan `type="button"` — HTML'in formlar içindeki `type="submit"` varsayılanı,
 * bir formun içine konan her butonun (ör. "iptal", "sil") istemeden formu göndermesine
 * yol açan yaygın bir hatadır. Gönderim yapması gereken butonlarda `type="submit"`'i
 * açıkça belirtin.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    disabled,
    type = "button",
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "lg" ? "md" : "sm"} aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {loading && loadingText ? loadingText : children}
      {!loading && rightIcon}
    </button>
  );
});
