import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface PillOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface PillToggleGroupProps {
  options: PillOption[];
  value: string | null;
  onChange: (value: string) => void;
  /** Görünür bir başlık yoksa erişilebilir ad için verin (bkz. aria-label). */
  "aria-label"?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Dolu-pil (segmented) tek seçimli seçici: süre/varyant/kart rengi/baskı rengi/önizleme
 * modu gibi "N seçenekten birini seç" kontrollerinin hepsinde aynı görünüm tekrar
 * kopyalanıyordu (bkz. AddToCartForm, CardOptionSelector, CardPreview). `RadioGroup`
 * bunu karşılamaz — o native radio dairesi + etiket görünümü kullanır, buradaki gibi
 * doldurulmuş bir buton grubu değil. `Tabs` da karşılamaz — o bir panel açıp/kapatan
 * sekme değil, yalnızca formun başka bir yerindeki seçimi değiştiren bir kontrol.
 */
export function PillToggleGroup({
  options,
  value,
  onChange,
  size = "md",
  className,
  ...props
}: PillToggleGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group" aria-label={props["aria-label"]}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={isSelected}
            onClick={() => !option.disabled && onChange(option.value)}
            className={cn(
              "rounded-full border font-medium transition-colors",
              "focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              size === "sm" ? "px-4 py-1.5 text-xs" : "px-4 py-2 text-sm",
              isSelected
                ? "border-brand bg-brand text-white"
                : "border-zinc-300 hover:border-brand dark:border-zinc-700 dark:text-zinc-400",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
