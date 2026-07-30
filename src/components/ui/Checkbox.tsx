import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: string;
  error?: string;
  /** Dış sarmalayıcıya uygulanır; `className` yalnızca `<input>` elemanını hedefler. */
  containerClassName?: string;
}

/**
 * Native `<input type="checkbox">` üzerine kurulu — rengi `accent-brand` ile temaya bağlanır,
 * kutunun kendisi tarayıcının yıllarca test edilmiş erişilebilirlik/klavye davranışını korur.
 *
 * Üç durumlu (indeterminate) kullanım gerekiyorsa (ör. bir tablodaki "tümünü seç" satırı)
 * `ref` üzerinden `ref.current.indeterminate = true` atayın — bu, bileşeni "use client"
 * gerektiren bir Effect eklemeden Server Component ağacında da çalışır durumda tutar.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, error, className, containerClassName, id, disabled, required, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const hasError = Boolean(error);
  const hasDescription = Boolean(description) && !hasError;
  const descriptionId = hasDescription ? `${fieldId}-description` : undefined;
  const errorId = hasError ? `${fieldId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <div className="flex items-start gap-2.5">
        <input
          ref={ref}
          type="checkbox"
          id={fieldId}
          disabled={disabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 accent-brand",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-zinc-700",
            className,
          )}
          {...props}
        />
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              "select-none text-sm text-zinc-900 dark:text-zinc-100",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            )}
          >
            {label}
            {required && (
              <span aria-hidden="true" className="ml-0.5 text-red-600">
                *
              </span>
            )}
          </label>
        )}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="pl-[1.625rem] text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : description ? (
        <p id={descriptionId} className="pl-[1.625rem] text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
});
