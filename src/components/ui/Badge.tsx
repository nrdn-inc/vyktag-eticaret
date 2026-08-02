import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold",
  {
    variants: {
      variant: {
        neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
        brand: "bg-brand/10 text-brand-dark dark:text-brand",
        /** Ürün görselleri üzerindeki dolu-renk pazarlama rozetleri (ör. "En çok satan") için — `brand` tonlu değil, dikkat çekmesi gereken vurgu rengi. */
        accent: "bg-accent text-white",
        success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
        danger: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

/** Durum/etiket rozeti — sipariş durumu, stok uyarısı, "Yeni" rozeti vb. Anlam yalnızca renkle taşınmaz; metinle birlikte kullanın. */
export function Badge({ variant, size, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
