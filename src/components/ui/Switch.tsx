import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: string;
  containerClassName?: string;
}

/**
 * Aç/kapa anahtarı — kapağın altında native `<input type="checkbox" role="switch">` çalışır,
 * track ve topuz salt görsel katmandır. Bir onay kutusundan farklı olarak *anlık* bir eylemi
 * (ör. "2FA'yı aç") temsil eder; bir formun parçası olarak gönderilecek çoklu seçimler için
 * `Checkbox`, tek seçenekten birini seçmek için `RadioGroup` kullanın.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, description, className, containerClassName, id, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const descriptionId = description ? `${fieldId}-description` : undefined;

  return (
    <div className={cn("flex items-start gap-3", containerClassName)}>
      <span className="relative inline-flex shrink-0">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={fieldId}
          disabled={disabled}
          aria-describedby={descriptionId}
          className={cn(
            "peer h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-zinc-300 transition-colors",
            "checked:bg-brand",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:bg-zinc-700",
            className,
          )}
          {...props}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </span>
      {(label || description) && (
        <span className="block space-y-0.5">
          {label && (
            <label
              htmlFor={fieldId}
              className={cn(
                "block text-sm font-medium text-zinc-900 dark:text-zinc-100",
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <span id={descriptionId} className="block text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </span>
          )}
        </span>
      )}
    </div>
  );
});
